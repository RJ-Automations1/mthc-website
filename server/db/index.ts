import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;

// Render's internal database URL doesn't need SSL; external/managed URLs do.
// Enable SSL unless connecting to localhost or an internal Render host.
const needsSSL =
  !/localhost|127\.0\.0\.1/.test(connectionString) &&
  !/@dpg-[a-z0-9-]+(\/|$)/.test(connectionString);

const pool = new pg.Pool({
  connectionString,
  max: 10,
  ssl: needsSSL ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });
export { pool };
