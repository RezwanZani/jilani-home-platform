import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

async function main() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const dbUrlLine = envFile.split('\n').find(line => line.startsWith('DATABASE_URL='));
  const dbUrl = dbUrlLine ? dbUrlLine.split('=')[1].trim() : process.env.DATABASE_URL;

  if (!dbUrl) throw new Error('No DATABASE_URL found');

  const sql = postgres(dbUrl.replace(/^"|"$/g, ''));
  await sql`TRUNCATE TABLE transactions CASCADE`;
  await sql`TRUNCATE TABLE property_reviews CASCADE`;
  console.log('Successfully truncated transactions and property_reviews');
  process.exit(0);
}

main();
