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

const dummyUsers = [
    { rank: 1, user: '8a...f3e', points: 1250000 },
    { rank: 2, user: 'b4...c1a', points: 1180500 },
    { rank: 3, user: 'd9...9b2', points: 1150000 },
    { rank: 4, user: '2c...7d8', points: 1090250 },
    { rank: 5, user: 'e1...a6f', points: 980750 },
    { rank: 6, user: 'f7...3e4', points: 950000 },
    { rank: 7, user: '1a...b2c', points: 920100 },
    { rank: 8, user: '3d...8f9', points: 890500 },
    { rank: 9, user: '6e...2g1', points: 880000 },
    { rank: 10, user: '7h...4i3', points: 870250 },
];

dummyUsers.forEach(u => {
    const pk = `${u.user.slice(0,4)}${Math.random().toString(36).substring(2, 6)}${u.user.slice(-3)}`;
    users.set(pk, {
        publicKey: pk,
        points: u.points,
        miningEndTime: null,
        tasksCompleted: { task1: true, task2: true, task3: true },
        referralCode: pk.slice(0, 8),
        referredBy: null,
        referredUsersCount: Math.floor(Math.random() * 20),
        referralBonus: Math.floor(Math.random() * 20) * 500,
        lastClaimed: null,
        username: u.user,
    });
});


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
      referralCode: publicKey.slice(0, 8),
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
