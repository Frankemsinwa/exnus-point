import clientPromise from './mongodb';
import { MongoClient, type Collection, type Db, type WithId } from 'mongodb';

// This is the raw user data structure stored in MongoDB
interface UserDocument {
  publicKey: string;
  points: number;
  miningEndTime: number | null;
  tasksCompleted: {
    task1: boolean;
    task2: boolean;
    task3: boolean;
  };
  referralCode: string;
  referredBy: string | null; // This will store the publicKey of the referrer
  referredUsersCount: number;
  referralBonus: number;
  lastClaimed: number | null;
  username: string;
  referralBonusProcessed: boolean;
}

// This is the type we will use throughout the application
export type User = WithId<UserDocument>;

let client: MongoClient;
let db: Db;
let users: Collection<UserDocument>;

async function init() {
  if (db) return;
  try {
    client = await clientPromise;
    db = client.db(); // This will use the database specified in your connection string
    users = db.collection<UserDocument>('users');
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw new Error('Failed to connect to the database.');
  }
}

// Initialize the connection when this module is loaded
(async () => {
  await init();
})();

const generateUniqueReferralCode = async (): Promise<string> => {
    await init();
    let code: string;
    let isUnique = false;
    do {
        code = Math.floor(100000 + Math.random() * 900000).toString();
        // Use countDocuments for efficiency
        if ((await users.countDocuments({ referralCode: code })) === 0) {
            isUnique = true;
        }
    } while (!isUnique);
    return code;
}

const getOrCreateUser = async (publicKey: string, referralCode?: string | null): Promise<User> => {
    await init();
    let user = await users.findOne({ publicKey });

    if (user) {
        return user as User;
    }
    
    const newUserDocument: UserDocument = {
        publicKey,
        points: 0,
        miningEndTime: null,
        tasksCompleted: { task1: false, task2: false, task3: false },
        referralCode: await generateUniqueReferralCode(),
        referredBy: null,
        referredUsersCount: 0,
        referralBonus: 0,
        lastClaimed: null,
        username: `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`,
        referralBonusProcessed: false,
    };
    
    if (referralCode) {
        const referrer = await users.findOne({ referralCode: referralCode });
        if (referrer && referrer.publicKey !== publicKey) {
            newUserDocument.referredBy = referrer.publicKey;
            await users.updateOne(
                { publicKey: referrer.publicKey },
                { $inc: { referredUsersCount: 1 } }
            );
        }
    }

    const result = await users.insertOne(newUserDocument);
    
    const createdUser = await users.findOne({ _id: result.insertedId });
    if (!createdUser) throw new Error("Failed to create and retrieve user.");
    
    return createdUser as User;
}

export const db = {
  getUser: async (publicKey: string, referralCode?: string | null): Promise<User> => {
    return getOrCreateUser(publicKey, referralCode);
  },
  getUserByPublicKey: async (publicKey: string): Promise<User | null> => {
    await init();
    return users.findOne({ publicKey });
  },
  updateUser: async (publicKey: string, data: Partial<UserDocument>): Promise<User | null> => {
    await init();
    const result = await users.findOneAndUpdate(
      { publicKey },
      { $set: data },
      { returnDocument: 'after' }
    );
    return result;
  },
  getLeaderboard: async (): Promise<User[]> => {
    await init();
    // Limit to top 100 for performance
    return users.find().sort({ points: -1 }).limit(100).toArray();
  },
  getTotalMined: async (): Promise<number> => {
    await init();
    const result = await users.aggregate([
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]).toArray();
    return result.length > 0 ? result[0].total : 0;
  },
  getActiveMiners: async (): Promise<number> => {
    await init();
    const now = Date.now();
    return users.countDocuments({ miningEndTime: { $gt: now } });
  }
};
