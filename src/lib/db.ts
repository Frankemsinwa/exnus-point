import { promises as fs } from 'fs';
import path from 'path';
import { lock, unlock } from 'proper-lockfile';

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

async function withDb<T>(op: (data: DBData) => Promise<{ result: T, newData?: DBData }>): Promise<T> {
    await fs.mkdir(path.dirname(dbPath), { recursive: true });

    try {
        await fs.access(dbPath);
    } catch {
        const initialDb: DBData = { users: [], referralCodeToPublicKey: [] };
        await fs.writeFile(dbPath, JSON.stringify(initialDb, null, 2), 'utf-8');
    }

    try {
        await lock(dbPath, { 
            retries: { retries: 5, factor: 1.2, minTimeout: 100, maxTimeout: 500 },
            stale: 10000, // Lock is considered stale after 10s
        });
        const fileContent = await fs.readFile(dbPath, 'utf-8');
        const dbData = JSON.parse(fileContent);
        const { result, newData } = await op(dbData);
        if (newData) {
            await fs.writeFile(dbPath, JSON.stringify(newData, null, 2), 'utf-8');
        }
        return result;
    } finally {
        try {
            await unlock(dbPath);
        } catch {}
    }
}

const generateUniqueReferralCode = (data: DBData): string => {
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
    return withDb(async (data) => {
        const userMap = new Map(data.users);
        if (userMap.has(publicKey)) {
            return { result: userMap.get(publicKey)! };
        }

        const newReferralCode = generateUniqueReferralCode(data);
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

        return { result: newUser, newData: data };
    });
};

const getUserByPublicKey = async (publicKey: string): Promise<User | null> => {
    return withDb(async (data) => {
        const userMap = new Map(data.users);
        const user = userMap.get(publicKey) || null;
        return { result: user };
    });
};

const updateUser = async (publicKey: string, updates: Partial<User>): Promise<User | null> => {
    return withDb(async (data) => {
        const userMap = new Map(data.users);
        const user = userMap.get(publicKey);

        if (!user) {
            return { result: null };
        }

        const updatedUser = { ...user, ...updates };
        userMap.set(publicKey, updatedUser);
        data.users = Array.from(userMap.entries());

        return { result: updatedUser, newData: data };
    });
};

const getLeaderboard = async (): Promise<User[]> => {
    return withDb(async (data) => {
        const users = Array.from(new Map(data.users).values());
        const sortedUsers = users.sort((a, b) => b.points - a.points).slice(0, 100);
        return { result: sortedUsers };
    });
};

const getTotalMined = async (): Promise<number> => {
    return withDb(async (data) => {
        const users = Array.from(new Map(data.users).values());
        const total = users.reduce((sum, user) => sum + user.points, 0);
        return { result: total };
    });
};

const getActiveMiners = async (): Promise<number> => {
    return withDb(async (data) => {
        const users = Array.from(new Map(data.users).values());
        const now = Date.now();
        const activeCount = users.filter(user => user.miningEndTime && user.miningEndTime > now).length;
        return { result: activeCount };
    });
};

const getAllUsers = async (): Promise<User[]> => {
    return withDb(async (data) => {
        const users = Array.from(new Map(data.users).values());
        return { result: users };
    });
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
