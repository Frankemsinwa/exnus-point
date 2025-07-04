"use server";

import { db } from "@/lib/db";

export async function getAdminData() {
    const users = await db.getAllUsers();
    return { users };
}
