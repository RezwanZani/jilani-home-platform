import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Cache the database connection in development to avoid connection exhaustion
const globalForDb = globalThis as unknown as {
    postgresClient: postgres.Sql | undefined;
};

// Disable prefetch as it is not supported for "Transaction" pool mode in production
const client = globalForDb.postgresClient ?? postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== 'production') {
    globalForDb.postgresClient = client;
}

export const db = drizzle(client, { schema });