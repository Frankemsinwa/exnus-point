import { promises as fs } from 'fs';
import path from 'path';

export type User = {
    publicKey: string;
    points: number;
    miningEndTime: number | null;
    tasksCompleted: {
        task1: boolean;
        task2: boolean;
        task3: boolean;
    };
    referralCode: string;
    referredBy: string | null;
    referredUsersCount: number;
    referralBonus: number;
    lastClaimed: number | null;
    username: string;
    referralBonusProcessed: boolean;
};

type DBData = {
    users: Map<string, User>;
    referralCodeToPublicKey: Map<string, string>;
};

const dbPath = path.join(process.cwd(), 'data', 'db.json');
let dbCache: DBData | null = null;
let dbLock = Promise.resolve();

// This function creates a mutex to ensure that database write operations are serialized.
// It prevents race conditions where multiple requests try to write to the db.json file at the same time.
async function withDbLock<T>(fn: () => Promise<T>): Promise<T> {
    // Wait for the previous operation to finish
    await dbLock;
    
    let releaseLock: () => void;
    // Set up the next lock promise. Subsequent calls will wait for this promise.
    dbLock = new Promise(resolve => {
        releaseLock = resolve;
    });

    try {
        // Execute the database operation
        const result = await fn();
        return result;
    } finally {
        // Release the lock for the next operation in the queue
        releaseLock!();
    }
}


async function readDb(): Promise<DBData> {
    if (dbCache) return dbCache;

    try {
        await fs.mkdir(path.dirname(dbPath), { recursive: true });
        const fileContent = await fs.readFile(dbPath, 'utf-8');
        const data = JSON.parse(fileContent);
        // Convert arrays to Maps for easier lookup
        dbCache = {
            users: new Map(data.users || []),
            referralCodeToPublicKey: new Map(data.referralCodeToPublicKey || [])
        };
        return dbCache!;
    } catch (error) {
        // If file doesn't exist or is empty, initialize with empty maps
        if ((error as NodeJS.ErrnoException).code === 'ENOENT' || error instanceof SyntaxError) {
             dbCache = {
                users: new Map(),
                referralCodeToPublicKey: new Map()
            };
            return dbCache;
        }
        throw error;
    }
}

async function writeDb(data: DBData): Promise<void> {
    const dataToWrite = {
        users: Array.from(data.users.entries()),
        referralCodeToPublicKey: Array.from(data.referralCodeToPublicKey.entries())
    };
    await fs.writeFile(dbPath, JSON.stringify(dataToWrite, null, 2), 'utf-8');
    dbCache = data; // Update cache
}

const generateUniqueReferralCode = (data: DBData): string => {
    let code: string;
    let isUnique = false;
    do {
        code = Math.floor(100000 + Math.random() * 900000).toString();
        if (!data.referralCodeToPublicKey.has(code)) {
            isUnique = true;
        }
    } while (!isUnique);
    return code;
};

const getOrCreateUser = async (publicKey: string, referralCode?: string | null): Promise<User> => {
    const data = await readDb();
    
    if (data.users.has(publicKey)) {
        return data.users.get(publicKey)!;
    }

    // User doesn't exist, we need to write. Acquire lock.
    return withDbLock(async () => {
        // Re-read data inside lock to handle race condition where user was created
        // between the initial check and acquiring the lock.
        const lockedData = await readDb();
        if (lockedData.users.has(publicKey)) {
            return lockedData.users.get(publicKey)!;
        }

        const newReferralCode = generateUniqueReferralCode(lockedData);
        const username = `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
        
        const newUser: User = {
            publicKey,
            points: 0,
            miningEndTime: null,
            tasksCompleted: { task1: false, task2: false, task3: false },
            referralCode: newReferralCode,
            referredBy: null,
            referredUsersCount: 0,
            referralBonus: 0,
            lastClaimed: null,
            username,
            referralBonusProcessed: false,
        };

        if (referralCode) {
            const referrerPublicKey = lockedData.referralCodeToPublicKey.get(referralCode);
            
            if (referrerPublicKey && referrerPublicKey !== publicKey) {
                const referrer = lockedData.users.get(referrerPublicKey);
                if (referrer) {
                    newUser.referredBy = referrerPublicKey;
                    referrer.referredUsersCount += 1;
                    lockedData.users.set(referrerPublicKey, referrer);
                }
            }
        }

        lockedData.users.set(publicKey, newUser);
        lockedData.referralCodeToPublicKey.set(newReferralCode, publicKey);
        
        await writeDb(lockedData);
        return newUser;
    });
};

const getUserByPublicKey = async (publicKey: string): Promise<User | null> => {
    const data = await readDb();
    return data.users.get(publicKey) || null;
};

const updateUser = async (publicKey: string, updates: Partial<User>): Promise<User | null> => {
    return withDbLock(async () => {
        const data = await readDb();
        const user = data.users.get(publicKey);

        if (!user) {
            return null;
        }

        const updatedUser = { ...user, ...updates };
        data.users.set(publicKey, updatedUser);

        await writeDb(data);
        return updatedUser;
    });
};

const getLeaderboard = async (): Promise<User[]> => {
    const data = await readDb();
    const users = Array.from(data.users.values());
    const sortedUsers = users.sort((a, b) => b.points - a.points);
    return sortedUsers;
};

const getTotalMined = async (): Promise<number> => {
    const data = await readDb();
    const users = Array.from(data.users.values());
    const total = users.reduce((sum, user) => sum + user.points, 0);
    return total;
};

const getActiveMiners = async (): Promise<number> => {
    const data = await readDb();
    const users = Array.from(data.users.values());
    const now = Date.now();
    const activeCount = users.filter(user => user.miningEndTime && user.miningEndTime > now).length;
    return activeCount;
};

const getAllUsers = async (): Promise<User[]> => {
    const data = await readDb();
    return Array.from(data.users.values());
};

export const db = {
    getUser: getOrCreateUser,
    getUserByPublicKey,
    updateUser,
    getLeaderboard,
    getTotalMined,
    getActiveMiners,
    getAllUsers
};
