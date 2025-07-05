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
    users: [string, User][];
    referralCodeToPublicKey: [string, string][];
};

const dbPath = path.join(process.cwd(), 'data', 'db.json');

// Always read directly from the file to ensure data consistency when locking.
async function readDb(): Promise<DBData> {
    try {
        await fs.mkdir(path.dirname(dbPath), { recursive: true });
        const fileContent = await fs.readFile(dbPath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            const initialDb: DBData = { users: [], referralCodeToPublicKey: [] };
            await fs.writeFile(dbPath, JSON.stringify(initialDb, null, 2), 'utf-8');
            return initialDb;
        }
        throw error;
    }
}

async function writeDb(data: DBData): Promise<void> {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

const generateUniqueReferralCode = async (data: DBData): Promise<string> => {
    let code: string;
    let isUnique = false;
    const referralCodes = new Set(data.referralCodeToPublicKey.map(([c]) => c));
    do {
        code = Math.floor(100000 + Math.random() * 900000).toString();
        if (!referralCodes.has(code)) {
            isUnique = true;
        }
    } while (!isUnique);
    return code;
};

const getOrCreateUser = async (publicKey: string, referralCode?: string | null): Promise<User> => {
    const data = await readDb();
    const userMap = new Map(data.users);

    if (userMap.has(publicKey)) {
        return userMap.get(publicKey)!;
    }

    // New user logic
    const newReferralCode = await generateUniqueReferralCode(data);
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

    // Handle referral if code is provided
    if (referralCode) {
        const referralMap = new Map(data.referralCodeToPublicKey);
        const referrerPublicKey = referralMap.get(referralCode);
        
        if (referrerPublicKey && referrerPublicKey !== publicKey) {
            const referrer = userMap.get(referrerPublicKey);
            if (referrer) {
                newUser.referredBy = referrerPublicKey;
                referrer.referredUsersCount += 1;
                userMap.set(referrerPublicKey, referrer);
            }
        }
    }

    userMap.set(publicKey, newUser);
    data.users = Array.from(userMap.entries());
    data.referralCodeToPublicKey.push([newReferralCode, publicKey]);

    await writeDb(data);
    return newUser;
};

const getUserByPublicKey = async (publicKey: string): Promise<User | null> => {
    const data = await readDb();
    const userMap = new Map(data.users);
    return userMap.get(publicKey) || null;
};

const updateUser = async (publicKey: string, updates: Partial<User>): Promise<User | null> => {
    const data = await readDb();
    const userMap = new Map(data.users);
    const user = userMap.get(publicKey);

    if (!user) {
        return null;
    }

    const updatedUser = { ...user, ...updates };
    userMap.set(publicKey, updatedUser);
    data.users = Array.from(userMap.entries());

    await writeDb(data);
    return updatedUser;
};

const getLeaderboard = async (): Promise<User[]> => {
    const data = await readDb();
    const users = Array.from(new Map(data.users).values());
    return users.sort((a, b) => b.points - a.points).slice(0, 100);
};

const getTotalMined = async (): Promise<number> => {
    const data = await readDb();
    const users = Array.from(new Map(data.users).values());
    return users.reduce((sum, user) => sum + user.points, 0);
};

const getActiveMiners = async (): Promise<number> => {
    const data = await readDb();
    const users = Array.from(new Map(data.users).values());
    const now = Date.now();
    return users.filter(user => user.miningEndTime && user.miningEndTime > now).length;
};

const getAllUsers = async (): Promise<User[]> => {
    const data = await readDb();
    return Array.from(new Map(data.users).values());
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
