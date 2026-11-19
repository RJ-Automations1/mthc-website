import crypto from 'crypto';
import pg from 'pg';
import { FUNDRAISER_ROSTER } from './roster';

/**
 * Player fundraiser — each player gets a public invite link (/fundraiser/:slug)
 * and a private envelope inbox (/fundraiser/:slug/inbox?key=…). Every gift is a
 * row in fundraiser_gifts; it lands in the player's inbox once it's paid.
 * Same Postgres as the rest of the site (DATABASE_URL); tables are created on first use.
 */

export type GiftStatus = 'pending' | 'paid' | 'cancelled';

export interface Player {
  id: number;
  slug: string;
  name: string;
  blurb: string | null;
  goal: number;
  portal_key: string;
  email: string | null;
  number: string | null;
  position: string | null;
  class_year: string | null;
  photo: string | null;
  claimed_at: string | null;
  pin_hash: string | null;
  created_at: string;
}

export interface Gift {
  ref: string;
  player_id: number;
  amount: number;
  donor_name: string;
  donor_email: string;
  note: string | null;
  anonymous: boolean;
  status: GiftStatus;
  square_order_id: string | null;
  pay_url: string | null;
  opened_at: string | null;
  contact_id: number | null;
  created_at: string;
}

let pool: pg.Pool | null = null;
let ready: Promise<void> | null = null;

function getPool() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!pool) {
    const needsSSL = !/localhost|127\.0\.0\.1/.test(url) && !/@dpg-[a-z0-9-]+(\/|$)/.test(url);
    pool = new pg.Pool({ connectionString: url, max: 5, ssl: needsSSL ? { rejectUnauthorized: false } : undefined });
  }
  return pool;
}

export async function db() {
  const p = getPool();
  if (!p) throw new Error('NO_DB');
  if (!ready) {
    ready = p
      .query(
        `CREATE TABLE IF NOT EXISTS fundraiser_players (
           id SERIAL PRIMARY KEY,
           slug VARCHAR(60) UNIQUE NOT NULL,
           name VARCHAR(120) NOT NULL,
           blurb VARCHAR(400),
           goal INTEGER NOT NULL DEFAULT 500,
           portal_key VARCHAR(64) NOT NULL,
           email VARCHAR(200),
           created_at TIMESTAMPTZ NOT NULL DEFAULT now()
         );
         CREATE TABLE IF NOT EXISTS fundraiser_gifts (
           id SERIAL PRIMARY KEY,
           ref VARCHAR(16) UNIQUE NOT NULL,
           player_id INTEGER NOT NULL REFERENCES fundraiser_players(id) ON DELETE CASCADE,
           amount INTEGER NOT NULL CHECK (amount > 0),
           donor_name VARCHAR(120) NOT NULL,
           donor_email VARCHAR(200) NOT NULL,
           note VARCHAR(600),
           anonymous BOOLEAN NOT NULL DEFAULT false,
           status VARCHAR(12) NOT NULL DEFAULT 'pending',
           square_order_id VARCHAR(64),
           pay_url TEXT,
           opened_at TIMESTAMPTZ,
           created_at TIMESTAMPTZ NOT NULL DEFAULT now()
         );
         CREATE INDEX IF NOT EXISTS fundraiser_gifts_player ON fundraiser_gifts (player_id);
         ALTER TABLE fundraiser_players ADD COLUMN IF NOT EXISTS number VARCHAR(10);
         ALTER TABLE fundraiser_players ADD COLUMN IF NOT EXISTS position VARCHAR(20);
         ALTER TABLE fundraiser_players ADD COLUMN IF NOT EXISTS class_year VARCHAR(10);
         ALTER TABLE fundraiser_players ADD COLUMN IF NOT EXISTS photo TEXT;
         ALTER TABLE fundraiser_players ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;
         ALTER TABLE fundraiser_players ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(200);
         CREATE TABLE IF NOT EXISTS fundraiser_contacts (
           id SERIAL PRIMARY KEY,
           ref VARCHAR(16) UNIQUE NOT NULL,
           player_id INTEGER NOT NULL REFERENCES fundraiser_players(id) ON DELETE CASCADE,
           name VARCHAR(120) NOT NULL,
           email VARCHAR(200),
           phone VARCHAR(20),
           emailed_at TIMESTAMPTZ,
           texted_at TIMESTAMPTZ,
           sms_sent_at TIMESTAMPTZ,
           visited_at TIMESTAMPTZ,
           donated_at TIMESTAMPTZ,
           followups INTEGER NOT NULL DEFAULT 0,
           last_followup_at TIMESTAMPTZ,
           last_chance_at TIMESTAMPTZ,
           unsubscribed_at TIMESTAMPTZ,
           send_error VARCHAR(300),
           created_at TIMESTAMPTZ NOT NULL DEFAULT now()
         );
         CREATE INDEX IF NOT EXISTS fundraiser_contacts_player ON fundraiser_contacts (player_id);
         ALTER TABLE fundraiser_gifts ADD COLUMN IF NOT EXISTS contact_id INTEGER REFERENCES fundraiser_contacts(id) ON DELETE SET NULL;`,
      )
      .then(() => seedRoster(p))
      .catch((e) => {
        ready = null;
        throw e;
      });
  }
  await ready;
  return p;
}

const DEFAULT_GOAL = Number(process.env.FUNDRAISER_DEFAULT_GOAL) || 500;

/** Gives every roster player a page (once). Existing pages keep their goal, links and gifts. */
async function seedRoster(p: pg.Pool) {
  for (const r of FUNDRAISER_ROSTER) {
    await p.query(
      `INSERT INTO fundraiser_players (slug, name, goal, portal_key, number, position, class_year, photo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (slug) DO UPDATE SET number = EXCLUDED.number, position = EXCLUDED.position,
         class_year = EXCLUDED.class_year, photo = EXCLUDED.photo`,
      [slugify(r.name), r.name, DEFAULT_GOAL, newKey(), r.number || null, r.position || null, r.year || null, r.photo || null],
    );
  }
}

export const storeAvailable = () => Boolean(process.env.DATABASE_URL);

const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const randomChunk = (n: number) => Array.from(crypto.randomBytes(n), (b) => ALPHA[b % ALPHA.length]).join('');
const newRef = () => `MTHC-${randomChunk(6)}`;
const newKey = () => crypto.randomBytes(18).toString('base64url');

const slugify = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'player';

// ── Players ──────────────────────────────────────────────────────────────────
export async function createPlayer(input: { name: string; blurb: string | null; goal: number; email: string | null }) {
  const p = await db();
  const base = slugify(input.name);
  for (let attempt = 0; attempt < 6; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${randomChunk(3).toLowerCase()}`;
    const { rows } = await p.query(
      `INSERT INTO fundraiser_players (slug, name, blurb, goal, portal_key, email)
       VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (slug) DO NOTHING RETURNING *`,
      [slug, input.name, input.blurb, input.goal, newKey(), input.email],
    );
    if (rows[0]) return rows[0] as Player;
  }
  throw new Error('Could not create a unique link');
}

/** Every player for the public roster page, with what they've raised. */
export async function rosterWithTotals() {
  const p = await db();
  const { rows } = await p.query(
    `SELECT pl.slug, pl.name, pl.number, pl.position, pl.class_year, pl.photo, pl.goal,
            COALESCE(SUM(g.amount) FILTER (WHERE g.status = 'paid'),0)::int AS raised,
            COUNT(g.id) FILTER (WHERE g.status = 'paid')::int AS gifts
     FROM fundraiser_players pl LEFT JOIN fundraiser_gifts g ON g.player_id = pl.id
     GROUP BY pl.id ORDER BY pl.name`,
  );
  return rows;
}

export async function getPlayer(slug: string) {
  const p = await db();
  const { rows } = await p.query(`SELECT * FROM fundraiser_players WHERE slug = $1`, [slug.toLowerCase()]);
  return (rows[0] as Player | undefined) ?? null;
}

export async function updatePlayer(id: number, fields: { blurb?: string | null; goal?: number; email?: string | null }) {
  const p = await db();
  await p.query(
    `UPDATE fundraiser_players SET blurb = COALESCE($2, blurb), goal = COALESCE($3, goal),
       email = CASE WHEN $4::boolean THEN $5 ELSE email END WHERE id = $1`,
    [id, fields.blurb ?? null, fields.goal ?? null, fields.email !== undefined, fields.email || null],
  );
}

// ── Player PIN (portal sign-in) ──────────────────────────────────────────────
const hashPin = (pin: string, salt = crypto.randomBytes(12).toString('hex')) =>
  `${salt}:${crypto.scryptSync(pin, salt, 32).toString('hex')}`;

export function pinMatches(pin: string, stored: string) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const a = Buffer.from(hashPin(pin, salt).split(':')[1], 'hex');
  const b = Buffer.from(hash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Sets a PIN only if the player doesn't have one yet. Returns false if one already exists. */
export async function setFirstPin(id: number, pin: string) {
  const p = await db();
  const { rowCount } = await p.query(
    `UPDATE fundraiser_players SET pin_hash = $2, claimed_at = now() WHERE id = $1 AND pin_hash IS NULL`,
    [id, hashPin(pin)],
  );
  return rowCount === 1;
}

export async function clearPin(id: number) {
  const p = await db();
  await p.query(`UPDATE fundraiser_players SET pin_hash = NULL, claimed_at = NULL WHERE id = $1`, [id]);
}

/** New private mailbox link; the old one stops working. */
export async function resetPortalKey(id: number) {
  const p = await db();
  const key = newKey();
  await p.query(`UPDATE fundraiser_players SET portal_key = $2, claimed_at = NULL WHERE id = $1`, [id, key]);
  return key;
}

export async function deletePlayer(id: number) {
  const p = await db();
  await p.query(`DELETE FROM fundraiser_players WHERE id = $1`, [id]);
}

/** Raised so far (paid gifts only) for one player. */
export async function playerTotals(playerId: number) {
  const p = await db();
  const { rows } = await p.query(
    `SELECT COALESCE(SUM(amount),0)::int AS raised, COUNT(*)::int AS gifts
     FROM fundraiser_gifts WHERE player_id = $1 AND status = 'paid'`,
    [playerId],
  );
  return rows[0] as { raised: number; gifts: number };
}

/** First names (or "Anonymous") of recent supporters — shown on the public page. Never notes or amounts. */
export async function recentSupporters(playerId: number, limit = 12) {
  const p = await db();
  const { rows } = await p.query(
    `SELECT donor_name, anonymous FROM fundraiser_gifts
     WHERE player_id = $1 AND status = 'paid' ORDER BY created_at DESC LIMIT $2`,
    [playerId, limit],
  );
  return rows.map((r: { donor_name: string; anonymous: boolean }) => (r.anonymous ? 'Anonymous' : r.donor_name.split(/\s+/)[0]));
}

// ── Gifts ────────────────────────────────────────────────────────────────────
export async function createGift(input: {
  playerId: number;
  amount: number;
  donorName: string;
  donorEmail: string;
  note: string | null;
  anonymous: boolean;
  contactId?: number | null;
}) {
  const p = await db();
  for (let attempt = 0; attempt < 5; attempt++) {
    const ref = newRef();
    const { rows } = await p.query(
      `INSERT INTO fundraiser_gifts (ref, player_id, amount, donor_name, donor_email, note, anonymous, contact_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (ref) DO NOTHING RETURNING ref`,
      [ref, input.playerId, input.amount, input.donorName, input.donorEmail, input.note, input.anonymous, input.contactId ?? null],
    );
    if (rows[0]) return ref;
  }
  throw new Error('Could not create a gift reference');
}

export async function saveGiftCheckout(ref: string, squareOrderId: string | null, payUrl: string) {
  const p = await db();
  await p.query(`UPDATE fundraiser_gifts SET square_order_id = $2, pay_url = $3 WHERE ref = $1`, [ref, squareOrderId, payUrl]);
}

export async function getGift(ref: string) {
  const p = await db();
  const { rows } = await p.query(`SELECT * FROM fundraiser_gifts WHERE ref = $1`, [ref.toUpperCase()]);
  return (rows[0] as Gift | undefined) ?? null;
}

export async function setGiftStatus(ref: string, status: GiftStatus) {
  const p = await db();
  const { rowCount } = await p.query(`UPDATE fundraiser_gifts SET status = $2 WHERE ref = $1`, [ref.toUpperCase(), status]);
  return rowCount === 1;
}

/** A player's delivered (paid) envelopes, newest first. */
export async function inbox(playerId: number) {
  const p = await db();
  const { rows } = await p.query(
    `SELECT ref, amount, donor_name, note, anonymous, opened_at, created_at
     FROM fundraiser_gifts WHERE player_id = $1 AND status = 'paid' ORDER BY created_at DESC`,
    [playerId],
  );
  return rows as Pick<Gift, 'ref' | 'amount' | 'donor_name' | 'note' | 'anonymous' | 'opened_at' | 'created_at'>[];
}

export async function markOpened(playerId: number, ref: string) {
  const p = await db();
  await p.query(
    `UPDATE fundraiser_gifts SET opened_at = COALESCE(opened_at, now()) WHERE player_id = $1 AND ref = $2 AND status = 'paid'`,
    [playerId, ref.toUpperCase()],
  );
}

// ── Admin ────────────────────────────────────────────────────────────────────
export async function adminReport() {
  const p = await db();
  const { rows: players } = await p.query(
    `SELECT pl.*, COALESCE(SUM(g.amount) FILTER (WHERE g.status = 'paid'),0)::int AS raised,
            COUNT(g.id) FILTER (WHERE g.status = 'paid')::int AS gifts,
            COUNT(g.id) FILTER (WHERE g.status = 'pending')::int AS pending
     FROM fundraiser_players pl LEFT JOIN fundraiser_gifts g ON g.player_id = pl.id
     GROUP BY pl.id ORDER BY raised DESC, pl.name`,
  );
  const { rows: gifts } = await p.query(
    `SELECT g.ref, g.amount, g.donor_name, g.donor_email, g.note, g.anonymous, g.status, g.opened_at, g.created_at,
            pl.name AS player_name, pl.slug AS player_slug
     FROM fundraiser_gifts g JOIN fundraiser_players pl ON pl.id = g.player_id
     ORDER BY g.created_at DESC LIMIT 1000`,
  );
  return { players, gifts };
}

export async function pendingGifts() {
  const p = await db();
  const { rows } = await p.query(`SELECT ref FROM fundraiser_gifts WHERE status = 'pending' AND square_order_id IS NOT NULL`);
  return rows.map((r: { ref: string }) => r.ref);
}
