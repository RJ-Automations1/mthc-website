import crypto from 'crypto';
import { db, pool } from './index';
import { games, boardMembers, coaches, awards, adminUsers } from './schema';
import { eq, sql } from 'drizzle-orm';

// Idempotent schema creation (runs on server startup so no separate migration
// step is needed on Render). Enums use DO-blocks since Postgres CREATE TYPE has
// no IF NOT EXISTS; tables use CREATE TABLE IF NOT EXISTS.
const DDL = `
DO $$ BEGIN CREATE TYPE tier AS ENUM ('single','double','triple','homerun'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE home_away AS ENUM ('home','away'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE role AS ENUM ('admin','superadmin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE category AS ENUM ('championship','award','milestone'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS donors (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  amount NUMERIC(10,2) NOT NULL,
  tier tier NOT NULL,
  display_name VARCHAR(200),
  anonymous BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  square_payment_id VARCHAR(255),
  square_order_id VARCHAR(255),
  consent_given BOOLEAN DEFAULT false NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS board_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  title VARCHAR(200) NOT NULL,
  bio TEXT,
  image_url VARCHAR(500),
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  opponent VARCHAR(200) NOT NULL,
  date VARCHAR(50) NOT NULL,
  time VARCHAR(50),
  location VARCHAR(300),
  home_away home_away NOT NULL,
  result VARCHAR(20),
  score_us INTEGER,
  score_them INTEGER,
  season VARCHAR(10) DEFAULT '2026',
  conference BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(200),
  role role DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS awards (
  id SERIAL PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  year VARCHAR(10),
  category category NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coaches (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  title VARCHAR(200) NOT NULL,
  bio TEXT,
  image_url VARCHAR(500),
  years_active VARCHAR(50),
  current BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);
`;

async function seedIfEmpty() {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(games);
  if (Number(count) > 0) return;

  console.log('🌱 Seeding sample content...');

  await db.insert(games).values([
    { opponent: 'Tuskegee University', date: '2026-02-14', time: '2:00 PM', location: 'Morehouse Field', homeAway: 'home', result: 'W', scoreUs: 7, scoreThem: 3, season: '2026', conference: true },
    { opponent: 'Clark Atlanta University', date: '2026-02-21', time: '1:00 PM', location: 'CAU Stadium', homeAway: 'away', result: 'W', scoreUs: 5, scoreThem: 2, season: '2026', conference: true },
    { opponent: 'Albany State University', date: '2026-02-28', time: '2:00 PM', location: 'Morehouse Field', homeAway: 'home', result: 'L', scoreUs: 3, scoreThem: 6, season: '2026', conference: true },
    { opponent: 'Fort Valley State', date: '2026-03-07', time: '1:00 PM', location: 'Fort Valley', homeAway: 'away', result: 'W', scoreUs: 8, scoreThem: 4, season: '2026', conference: true },
    { opponent: 'Savannah State', date: '2026-03-14', time: '2:00 PM', location: 'Morehouse Field', homeAway: 'home', result: 'W', scoreUs: 6, scoreThem: 1, season: '2026', conference: true },
    { opponent: 'Benedict College', date: '2026-03-21', time: '1:00 PM', location: 'Columbia, SC', homeAway: 'away', result: 'L', scoreUs: 2, scoreThem: 5, season: '2026', conference: true },
    { opponent: 'Lane College', date: '2026-03-28', time: '2:00 PM', location: 'Morehouse Field', homeAway: 'home', result: 'W', scoreUs: 9, scoreThem: 3, season: '2026', conference: true },
    { opponent: 'Miles College', date: '2026-04-04', time: '1:00 PM', location: 'Birmingham, AL', homeAway: 'away', result: 'W', scoreUs: 4, scoreThem: 2, season: '2026', conference: true },
    { opponent: 'Kentucky State', date: '2026-04-11', time: '2:00 PM', location: 'Morehouse Field', homeAway: 'home', result: 'L', scoreUs: 1, scoreThem: 3, season: '2026', conference: true },
    { opponent: 'LeMoyne-Owen', date: '2026-04-18', time: '1:00 PM', location: 'Memphis, TN', homeAway: 'away', result: 'W', scoreUs: 11, scoreThem: 4, season: '2026', conference: true },
  ]);

  await db.insert(boardMembers).values([
    { name: 'Board President', title: 'President', bio: 'Morehouse alumnus and dedicated supporter of Maroon Tiger Baseball.', order: 1, active: true },
    { name: 'Board Vice President', title: 'Vice President', bio: 'Committed to advancing the baseball program through community engagement.', order: 2, active: true },
    { name: 'Board Treasurer', title: 'Treasurer', bio: 'Managing the financial growth and sustainability of the MTHC.', order: 3, active: true },
    { name: 'Board Secretary', title: 'Secretary', bio: 'Ensuring organizational excellence and communication.', order: 4, active: true },
  ]);

  await db.insert(coaches).values([
    { name: 'Head Coach', title: 'Head Baseball Coach', bio: 'Leading the Maroon Tigers with passion and dedication.', yearsActive: '2020-Present', current: true, order: 1 },
    { name: 'Assistant Coach', title: 'Assistant Coach / Pitching', bio: 'Developing the next generation of Morehouse pitchers.', yearsActive: '2021-Present', current: true, order: 2 },
    { name: 'Assistant Coach', title: 'Assistant Coach / Hitting', bio: 'Building offensive excellence in the program.', yearsActive: '2022-Present', current: true, order: 3 },
  ]);

  await db.insert(awards).values([
    { title: 'SIAC Conference Championship', year: '2024', category: 'championship', description: 'Morehouse Baseball wins the SIAC Conference Championship.' },
    { title: 'SIAC Conference Championship', year: '2019', category: 'championship', description: 'Back-to-back era begins with SIAC title.' },
    { title: 'SIAC Player of the Year', year: '2024', category: 'award', description: 'Morehouse player earns top conference honor.' },
    { title: 'Program Revival', year: '2017', category: 'milestone', description: 'Morehouse Baseball program revived after hiatus.' },
    { title: 'First HBCU in NCAA D2 Tournament', year: '2024', category: 'milestone', description: 'Historic appearance in the NCAA Division II Tournament.' },
  ]);
}

async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const existing = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  if (existing.length) return;
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  await db.insert(adminUsers).values({ email, passwordHash, name: 'Admin', role: 'admin' });
  console.log('👤 Admin user created:', email);
}

export async function initDb() {
  await pool.query(DDL);
  await seedIfEmpty();
  await ensureAdmin();
  console.log('🗄️  Database ready.');
}
