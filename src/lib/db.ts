
export interface User {
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
}

const users: Map<string, User> = new Map();

// Helper to generate a unique 6-digit referral code
const generateUniqueReferralCode = (): string => {
    let code: string;
    const existingCodes = new Set(Array.from(users.values()).map(u => u.referralCode));
    do {
        // Generate a random 6-digit number as a string
        code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (existingCodes.has(code)); // Ensure the code is unique
    return code;
}

const getOrCreateUser = (publicKey: string): User => {
  if (!users.has(publicKey)) {
    const newUser: User = {
      publicKey,
      points: 0,
      miningEndTime: null,
      tasksCompleted: {
        task1: false,
        task2: false,
        task3: false,
      },
      referralCode: generateUniqueReferralCode(),
      referredBy: null,
      referredUsersCount: 0,
      referralBonus: 0,
      lastClaimed: null,
      username: `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
    };
    users.set(publicKey, newUser);
  }
  return users.get(publicKey)!;
};

export const db = {
  getUser: (publicKey: string): User => {
    return getOrCreateUser(publicKey);
  },
  updateUser: (publicKey: string, data: Partial<User>): User => {
    const user = getOrCreateUser(publicKey);
    const updatedUser = { ...user, ...data };
    users.set(publicKey, updatedUser);
    return updatedUser;
  },
  getLeaderboard: (): User[] => {
    return Array.from(users.values()).sort((a, b) => b.points - a.points);
  },
  getTotalMined: (): number => {
    return Array.from(users.values()).reduce((sum, user) => sum + user.points, 0);
  },
  getActiveMiners: (): number => {
    const now = Date.now();
    return Array.from(users.values()).filter(u => u.miningEndTime && u.miningEndTime > now).length;
  }
};
