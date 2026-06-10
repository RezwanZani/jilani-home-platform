
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in the environment variables');
}

// Creates a serverless-safe connection pool that supports transactions
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, { schema });