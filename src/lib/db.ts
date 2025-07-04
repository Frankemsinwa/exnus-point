import { PrismaClient, User as PrismaUser } from '@prisma/client';

// Add tasksCompleted to the Prisma-generated User type for compatibility with the frontend
export type User = PrismaUser & {
    tasksCompleted: {
        task1: boolean;
        task2: boolean;
        task3: boolean;
    };
};

const prisma = new PrismaClient();

// Helper to convert Prisma User to our extended User type
function toAppUser(user: PrismaUser): User {
    return {
        ...user,
        tasksCompleted: {
            task1: user.task1,
            task2: user.task2,
            task3: user.task3,
        }
    };
}

const generateUniqueReferralCode = async (): Promise<string> => {
    let code: string;
    let isUnique = false;
    do {
        code = Math.floor(100000 + Math.random() * 900000).toString();
        const existingUser = await prisma.user.findUnique({
            where: { referralCode: code },
        });
        if (!existingUser) {
            isUnique = true;
        }
    } while (!isUnique);
    return code;
};

const getOrCreateUser = async (publicKey: string, referralCode?: string | null): Promise<User> => {
    const existingUser = await prisma.user.findUnique({
        where: { publicKey },
    });

    if (existingUser) {
        return toAppUser(existingUser);
    }

    // New user logic
    const newReferralCode = await generateUniqueReferralCode();
    const username = `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
    let referredByPublicKey: string | null = null;

    // Handle referral if code is provided
    if (referralCode) {
        const referrer = await prisma.user.findUnique({
            where: { referralCode },
        });
        if (referrer && referrer.publicKey !== publicKey) {
            referredByPublicKey = referrer.publicKey;
            await prisma.user.update({
                where: { publicKey: referredByPublicKey },
                data: { referredUsersCount: { increment: 1 } },
            });
        }
    }

    const newUser = await prisma.user.create({
        data: {
            publicKey,
            referralCode: newReferralCode,
            username,
            referredBy: referredByPublicKey,
        },
    });

    return toAppUser(newUser);
};

const getUserByPublicKey = async (publicKey: string): Promise<User | null> => {
    const user = await prisma.user.findUnique({ where: { publicKey } });
    return user ? toAppUser(user) : null;
};

const updateUser = async (publicKey: string, data: Partial<PrismaUser & { tasksCompleted?: { task1?: boolean; task2?: boolean; task3?: boolean; } }>): Promise<User | null> => {
    
    // Flatten tasksCompleted into the main data object for Prisma
    if (data.tasksCompleted) {
        if (data.tasksCompleted.task1 !== undefined) data.task1 = data.tasksCompleted.task1;
        if (data.tasksCompleted.task2 !== undefined) data.task2 = data.tasksCompleted.task2;
        if (data.tasksCompleted.task3 !== undefined) data.task3 = data.tasksCompleted.task3;
        delete data.tasksCompleted;
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { publicKey },
            data,
        });
        return toAppUser(updatedUser);
    } catch (error) {
        console.error("Failed to update user:", error);
        return null;
    }
};

const getLeaderboard = async (): Promise<User[]> => {
    const users = await prisma.user.findMany({
        orderBy: { points: 'desc' },
        take: 100,
    });
    return users.map(toAppUser);
};

const getTotalMined = async (): Promise<number> => {
    const aggregate = await prisma.user.aggregate({
        _sum: { points: true },
    });
    return aggregate._sum.points || 0;
};

const getActiveMiners = async (): Promise<number> => {
    const now = BigInt(Date.now());
    const count = await prisma.user.count({
        where: { miningEndTime: { gt: now } },
    });
    return count;
};

export const db = {
    getUser: getOrCreateUser,
    getUserByPublicKey,
    updateUser,
    getLeaderboard,
    getTotalMined,
    getActiveMiners,
};
