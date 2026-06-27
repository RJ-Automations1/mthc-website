import {
  pgTable,
  pgEnum,
  varchar,
  integer,
  serial,
  text,
  boolean,
  timestamp,
  decimal,
} from 'drizzle-orm/pg-core';

// Enums (Postgres)
export const tierEnum = pgEnum('tier', ['single', 'double', 'triple', 'homerun']);
export const homeAwayEnum = pgEnum('home_away', ['home', 'away']);
export const roleEnum = pgEnum('role', ['admin', 'superadmin']);
export const categoryEnum = pgEnum('category', ['championship', 'award', 'milestone']);

// Donors table - stores donor registration and payment info
export const donors = pgTable('donors', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  tier: tierEnum('tier').notNull(),
  displayName: varchar('display_name', { length: 200 }),
  anonymous: boolean('anonymous').default(false),
  approved: boolean('approved').default(false),
  squarePaymentId: varchar('square_payment_id', { length: 255 }),
  squareOrderId: varchar('square_order_id', { length: 255 }),
  consentGiven: boolean('consent_given').default(false).notNull(),
  message: text('message'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Board members table
export const boardMembers = pgTable('board_members', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  bio: text('bio'),
  imageUrl: varchar('image_url', { length: 500 }),
  order: integer('display_order').default(0),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Schedule/Games table
export const games = pgTable('games', {
  id: serial('id').primaryKey(),
  opponent: varchar('opponent', { length: 200 }).notNull(),
  date: varchar('date', { length: 50 }).notNull(),
  time: varchar('time', { length: 50 }),
  location: varchar('location', { length: 300 }),
  homeAway: homeAwayEnum('home_away').notNull(),
  result: varchar('result', { length: 20 }),
  scoreUs: integer('score_us'),
  scoreThem: integer('score_them'),
  season: varchar('season', { length: 10 }).default('2026'),
  conference: boolean('conference').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Admin users table
export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 200 }),
  role: roleEnum('role').default('admin'),
  createdAt: timestamp('created_at').defaultNow(),
});

// History/Awards table
export const awards = pgTable('awards', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 300 }).notNull(),
  year: varchar('year', { length: 10 }),
  category: categoryEnum('category').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Coaches table
export const coaches = pgTable('coaches', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  bio: text('bio'),
  imageUrl: varchar('image_url', { length: 500 }),
  yearsActive: varchar('years_active', { length: 50 }),
  current: boolean('current').default(true),
  order: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});
