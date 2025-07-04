"use server";

import { db, User } from "@/lib/db";

const TOTAL_TOKEN_SUPPLY = 100_000_000;

export async function getAdminDashboardData() {
    const allUsers = await db.getAllUsers();
    
    const totalPoints = allUsers.reduce((sum, user) => sum + user.points, 0);

    const usersWithAirdrop = allUsers.map(user => {
        const airdropAllocation = totalPoints > 0 
            ? (user.points / totalPoints) * TOTAL_TOKEN_SUPPLY 
            : 0;
        
        return {
            ...user,
            airdropAllocation,
        };
    }).sort((a,b) => b.points - a.points);

    const stats = {
        totalUsers: allUsers.length,
        totalPoints,
        totalTokens: TOTAL_TOKEN_SUPPLY,
    };

    return { users: usersWithAirdrop, stats };
}
