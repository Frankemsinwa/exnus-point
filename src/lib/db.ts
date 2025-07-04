
import { createClient, type VercelClient } from '@vercel/postgres';

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

// Helper function to map database rows (with snake_case) to User objects (with camelCase)
function mapRowToUser(row: any): User {
    return {
        publicKey: row.public_key,
        points: Number(row.points),
        miningEndTime: row.mining_end_time ? Number(row.mining_end_time) : null,
        tasksCompleted: {
            task1: row.task1,
            task2: row.task2,
            task3: row.task3,
        },
        referralCode: row.referral_code,
        referredBy: row.referred_by,
        referredUsersCount: Number(row.referred_users_count),
        referralBonus: Number(row.referral_bonus),
        lastClaimed: row.last_claimed ? Number(row.last_claimed) : null,
        username: row.username,
        referralBonusProcessed: row.referral_bonus_processed,
    };
}

// Helper to convert camelCase to snake_case for dynamic queries
function toSnakeCase(str: string) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// Wrapper to handle client connection and disconnection
async function withClient<T>(callback: (client: VercelClient) => Promise<T>): Promise<T> {
    const client = createClient();
    await client.connect();
    try {
        return await callback(client);
    } finally {
        await client.end();
    }
}


// This function ensures the 'users' table exists. It is called automatically.
async function setupDatabase() {
    console.log("Attempting to set up database schema...");
    return withClient(async (client) => {
        try {
            await client.sql`
                CREATE TABLE IF NOT EXISTS users (
                    public_key VARCHAR(44) PRIMARY KEY,
                    points INTEGER DEFAULT 0 NOT NULL,
                    mining_end_time BIGINT,
                    task1 BOOLEAN DEFAULT FALSE NOT NULL,
                    task2 BOOLEAN DEFAULT FALSE NOT NULL,
                    task3 BOOLEAN DEFAULT FALSE NOT NULL,
                    referral_code VARCHAR(6) UNIQUE NOT NULL,
                    referred_by VARCHAR(44),
                    referred_users_count INTEGER DEFAULT 0 NOT NULL,
                    referral_bonus INTEGER DEFAULT 0 NOT NULL,
                    last_claimed BIGINT,
                    username VARCHAR(13) NOT NULL,
                    referral_bonus_processed BOOLEAN DEFAULT FALSE NOT NULL
                );
            `;
            console.log("SUCCESS: 'users' table created or already exists.");

             // Add foreign key constraint separately to avoid errors if the table already exists.
            await client.sql`
                ALTER TABLE users
                ADD CONSTRAINT fk_referred_by
                FOREIGN KEY (referred_by) 
                REFERENCES users(public_key);
            `;
            console.log("SUCCESS: Foreign key constraint 'fk_referred_by' ensured.");

        } catch (error: any) {
            // Ignore error if constraint already exists (42710 is duplicate_object for postgres)
            if (error.code === '42710' || error.message.includes('already exists')) {
                console.log("INFO: Schema objects already exist, skipping creation.");
            } else {
                console.error("ERROR: Failed to set up database schema.", error);
                throw error; // Re-throw other errors
            }
        }
    });
}


const generateUniqueReferralCode = async (): Promise<string> => {
    return withClient(async (client) => {
        let code: string;
        let isUnique = false;
        do {
            code = Math.floor(100000 + Math.random() * 900000).toString();
            const { rows } = await client.sql`SELECT 1 FROM users WHERE referral_code = ${code}`;
            if (rows.length === 0) {
                isUnique = true;
            }
        } while (!isUnique);
        return code;
    });
}


const getOrCreateUser = async (publicKey: string, referralCode?: string | null): Promise<User> => {
    await setupDatabase();
    
    return withClient(async (client) => {
        const existingUserResult = await client.sql`SELECT * FROM users WHERE public_key = ${publicKey}`;
        if (existingUserResult.rows.length > 0) {
            return mapRowToUser(existingUserResult.rows[0]);
        }
        
        // User does not exist, create new user
        const newReferralCode = await generateUniqueReferralCode();
        const username = `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
        let referredBy: string | null = null;

        if (referralCode) {
            const referrerResult = await client.sql`SELECT public_key FROM users WHERE referral_code = ${referralCode}`;
            if (referrerResult.rows.length > 0) {
                const referrerPublicKey = referrerResult.rows[0].public_key;
                if(referrerPublicKey !== publicKey){
                    referredBy = referrerPublicKey;
                     await client.sql`
                        UPDATE users
                        SET referred_users_count = referred_users_count + 1
                        WHERE public_key = ${referredBy};
                    `;
                }
            }
        }

        const { rows } = await client.sql`
            INSERT INTO users (public_key, referral_code, username, referred_by)
            VALUES (${publicKey}, ${newReferralCode}, ${username}, ${referredBy})
            RETURNING *;
        `;
        
        return mapRowToUser(rows[0]);
    });
}

const getUserByPublicKey = async (publicKey: string): Promise<User | null> => {
    await setupDatabase();
    return withClient(async (client) => {
        const { rows } = await client.sql`SELECT * FROM users WHERE public_key = ${publicKey}`;
        if (rows.length === 0) {
            return null;
        }
        return mapRowToUser(rows[0]);
    });
};


const updateUser = async (publicKey: string, data: Partial<User>): Promise<User | null> => {
    await setupDatabase();
    
    return withClient(async (client) => {
        const flattenedData: { [key: string]: any } = { ...data };
        if (data.tasksCompleted) {
            if (data.tasksCompleted.task1 !== undefined) flattenedData.task1 = data.tasksCompleted.task1;
            if (data.tasksCompleted.task2 !== undefined) flattenedData.task2 = data.tasksCompleted.task2;
            if (data.tasksCompleted.task3 !== undefined) flattenedData.task3 = data.tasksCompleted.task3;
            delete flattenedData.tasksCompleted;
        }
        
        const columns = Object.keys(flattenedData);
        if (columns.length === 0) {
            const { rows } = await client.sql`SELECT * FROM users WHERE public_key = ${publicKey}`;
            return rows.length > 0 ? mapRowToUser(rows[0]) : null;
        }

        const setParts = columns.map((key, index) => `${toSnakeCase(key)} = $${index + 2}`);
        const query = `UPDATE users SET ${setParts.join(', ')} WHERE public_key = $1 RETURNING *`;
        
        const values = [publicKey, ...Object.values(flattenedData)];
        
        const result = await client.query(query, values);

        if (result.rows.length === 0) {
            return null;
        }
        return mapRowToUser(result.rows[0]);
    });
};


const getLeaderboard = async (): Promise<User[]> => {
    await setupDatabase();
    return withClient(async (client) => {
        const { rows } = await client.sql`SELECT * FROM users ORDER BY points DESC LIMIT 100`;
        return rows.map(mapRowToUser);
    });
};

const getTotalMined = async (): Promise<number> => {
    await setupDatabase();
    return withClient(async (client) => {
        const { rows } = await client.sql`SELECT SUM(points) as total FROM users`;
        return Number(rows[0].total) || 0;
    });
};

const getActiveMiners = async (): Promise<number> => {
    await setupDatabase();
    return withClient(async (client) => {
        const now = Date.now();
        const { rows } = await client.sql`SELECT COUNT(*) FROM users WHERE mining_end_time > ${now}`;
        return Number(rows[0].count);
    });
};


export const db = {
    getUser: getOrCreateUser,
    getUserByPublicKey,
    updateUser,
    getLeaderboard,
    getTotalMined,
    getActiveMiners
};
