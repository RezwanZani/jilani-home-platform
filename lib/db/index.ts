import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in the environment variables');
}

// 1. Initialize the Neon HTTP connection
// Note: We no longer need the globalThis caching hack because HTTP connections are stateless!
const sql = neon(connectionString);

// 2. Export the Drizzle client
export const db = drizzle(sql, { schema });