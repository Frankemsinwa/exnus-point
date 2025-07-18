
'use server';

import { db, type User } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { MINE_DURATION_MS, POINTS_PER_SESSION } from '@/lib/constants';

export async function getUserData(publicKey: string): Promise<User | null> {
    if (!publicKey) return null;
    return await db.getUser(publicKey);
}

export async function getDashboardData(publicKey: string, referralCode?: string | null) {
    if (!publicKey) return null;

    const user = await db.getUser(publicKey, referralCode);
    const allUsers = await db.getLeaderboard();
    const rank = allUsers.findIndex(u => u.publicKey === publicKey) + 1;

    const stats = {
        totalPointsMined: await db.getTotalMined(),
        activeMiners: await db.getActiveMiners(),
        userRank: rank > 0 ? rank : allUsers.length + 1,
    };

    return { user, stats };
}


export async function activateMining(publicKey: string): Promise<{ success: boolean; message: string }> {
    if (!publicKey) return { success: false, message: 'Wallet not connected.' };

    const user = await db.getUser(publicKey);
    const allTasksCompleted = Object.values(user.tasksCompleted).every(Boolean);

    if (!allTasksCompleted) {
        return { success: false, message: 'Complete all tasks to start mining.' };
    }
    
    if (user.miningEndTime && user.miningEndTime > Date.now()) {
        return { success: false, message: 'Mining is already active.' };
    }

    const updates: Partial<User> = { miningEndTime: Date.now() + MINE_DURATION_MS };

    // Handle referral bonus on first activation
    if (user.referredBy && !user.referralBonusProcessed) {
        const referrer = await db.getUserByPublicKey(user.referredBy);
        if (referrer) {
            const bonus = 100;
            await db.updateUser(referrer.publicKey, {
                points: referrer.points + bonus,
                referralBonus: referrer.referralBonus + bonus,
            });
        }
        updates.referralBonusProcessed = true;
    }

    await db.updateUser(publicKey, updates);
    
    revalidatePath('/dashboard');
    return { success: true, message: 'Mining activated!' };
}

export async function completeTask(publicKey: string, taskId: 'task1' | 'task2' | 'task3'): Promise<{ success: boolean }> {
    if (!publicKey) return { success: false };
    
    const user = await db.getUser(publicKey);
    const updatedTasks = { ...user.tasksCompleted, [taskId]: true };
    await db.updateUser(publicKey, { tasksCompleted: updatedTasks });
    
    revalidatePath('/dashboard');
    return { success: true };
}

export async function claimReward(publicKey: string): Promise<{ success: boolean; message: string; newBalance?: number }> {
    if (!publicKey) return { success: false, message: 'Wallet not connected.' };

    const user = await db.getUser(publicKey);

    if (!user.miningEndTime || user.miningEndTime > Date.now()) {
        return { success: false, message: 'Mining session not yet complete.' };
    }

    const newBalance = user.points + POINTS_PER_SESSION;
    await db.updateUser(publicKey, { 
        points: newBalance,
        miningEndTime: null,
        lastClaimed: Date.now()
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/leaderboard');
    return { success: true, message: `+${POINTS_PER_SESSION} points claimed!`, newBalance };
}

export async function getLeaderboardPageData(publicKey: string) {
    if (!publicKey) return {leaderboard: []};
    
    const leaderboard = await db.getLeaderboard();
    const userIndex = leaderboard.findIndex(u => u.publicKey === publicKey);
    
    let topUsers = leaderboard.slice(0, 10).map((u, i) => ({
        rank: i + 1,
        user: u.username,
        points: u.points.toLocaleString(),
    }));

    if(userIndex !== -1 && userIndex >= 10) {
        const userEntry = leaderboard[userIndex];
        topUsers.push({rank: userIndex + 1, user: `${userEntry.username} (You)`, points: userEntry.points.toLocaleString()});
    } else if (userIndex !== -1) {
        topUsers[userIndex].user = `${topUsers[userIndex].user} (You)`;
    }

    return {
        leaderboard: topUsers,
    };
}


export async function getReferralPageData(publicKey: string) {
    if (!publicKey) return null;
    const user = await db.getUser(publicKey);
    
    const referralLink = `https://points.exnus.xyz/join?ref=${user.referralCode}`;

    return {
        referralLink,
        referredUsers: user.referredUsersCount,
        bonusPoints: user.referralBonus
    }
}
