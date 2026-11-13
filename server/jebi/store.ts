import crypto from 'crypto';
import pg from 'pg';
import { SHOP_TIERS, findItem, priceOf } from './shopCatalog';

/**
 * JEBI shop orders — every purchase and every free sponsor claim is a row here,
 * and stock left = starting qty − all non-cancelled rows. Uses the same Postgres
 * as the MTHC site (DATABASE_URL); the table is created on first use.
 */

export type OrderKind = 'purchase' | 'claim';
export type OrderStatus = 'pending' | 'paid' | 'fulfilled' | 'cancelled';

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

async function ensureTable() {
  const p = getPool();
  if (!p) throw new Error('NO_DB');
  if (!ready) {
    ready = p
      .query(
        `CREATE TABLE IF NOT EXISTS jebi_shop_orders (
           id SERIAL PRIMARY KEY,
           ref VARCHAR(16) UNIQUE NOT NULL,
           item_id VARCHAR(40) NOT NULL,
           option_id VARCHAR(40),
           qty INTEGER NOT NULL CHECK (qty > 0),
           unit_price INTEGER NOT NULL,
           total INTEGER NOT NULL,
           kind VARCHAR(10) NOT NULL,
           tier_code INTEGER,
           name VARCHAR(120) NOT NULL,
           email VARCHAR(200) NOT NULL,
           phone VARCHAR(40),
           status VARCHAR(12) NOT NULL DEFAULT 'pending',
           created_at TIMESTAMPTZ NOT NULL DEFAULT now()
         );
         CREATE INDEX IF NOT EXISTS jebi_shop_orders_item ON jebi_shop_orders (item_id);
         ALTER TABLE jebi_shop_orders ADD COLUMN IF NOT EXISTS access_code VARCHAR(40);
         ALTER TABLE jebi_shop_orders ADD COLUMN IF NOT EXISTS square_order_id VARCHAR(64);
         ALTER TABLE jebi_shop_orders ADD COLUMN IF NOT EXISTS pay_url TEXT;
         CREATE TABLE IF NOT EXISTS jebi_access_codes (
           code VARCHAR(40) PRIMARY KEY,
           tier INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 3),
           label VARCHAR(160),
           created_at TIMESTAMPTZ NOT NULL DEFAULT now()
         );`,
      )
      .then(() => undefined)
      .catch((e) => {
        ready = null;
        throw e;
      });
  }
  return ready;
}

export const storeAvailable = () => Boolean(process.env.DATABASE_URL);

/** Units taken (purchased or claimed, not cancelled) per item. */
export async function takenByItem(): Promise<Map<string, number>> {
  await ensureTable();
  const { rows } = await getPool()!.query(
    `SELECT item_id, COALESCE(SUM(qty),0)::int AS taken FROM jebi_shop_orders WHERE status <> 'cancelled' GROUP BY item_id`,
  );
  return new Map(rows.map((r: { item_id: string; taken: number }) => [r.item_id, r.taken]));
}

const newRef = () => 'JEBI-' + crypto.randomBytes(3).toString('hex').toUpperCase();

export class StockError extends Error {}

// ── Access codes ─────────────────────────────────────────────────────────────
// Each code is good for ONE free item. Codes come from the admin page (stored in
// jebi_access_codes) or the JEBI_ACCESS_CODES env var ("CODE:TIER,...").
export const normalizeCode = (code: string) => code.trim().toUpperCase().replace(/\s+/g, '');

function envCodes(): Map<string, 1 | 2 | 3> {
  const map = new Map<string, 1 | 2 | 3>();
  for (const entry of (process.env.JEBI_ACCESS_CODES || '').split(',')) {
    const [c, tier] = entry.split(':').map((s) => s?.trim());
    const n = Number(tier);
    if (c && (n === 1 || n === 2 || n === 3)) map.set(normalizeCode(c), n);
  }
  return map;
}

export async function lookupCode(raw: string): Promise<{ code: string; tier: 1 | 2 | 3; usedRef: string | null } | null> {
  const code = normalizeCode(raw);
  if (!code) return null;
  let tier: 1 | 2 | 3 | null = envCodes().get(code) ?? null;
  let usedRef: string | null = null;
  if (storeAvailable()) {
    await ensureTable();
    if (!tier) {
      const { rows } = await getPool()!.query(`SELECT tier FROM jebi_access_codes WHERE code = $1`, [code]);
      if (rows[0]) tier = rows[0].tier;
    }
    if (tier) usedRef = await codeUsedRef(code);
  }
  return tier ? { code, tier, usedRef } : null;
}

async function codeUsedRef(code: string, client: pg.PoolClient | pg.Pool = getPool()!) {
  const { rows } = await client.query(
    `SELECT ref FROM jebi_shop_orders WHERE access_code = $1 AND kind = 'claim' AND status <> 'cancelled' LIMIT 1`,
    [code],
  );
  return (rows[0]?.ref as string) ?? null;
}

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const randomChunk = (n: number) => Array.from(crypto.randomBytes(n), (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');

export async function createCode(tier: 1 | 2 | 3, label: string) {
  await ensureTable();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = `JEBI${tier}-${randomChunk(4)}-${randomChunk(4)}`;
    const { rowCount } = await getPool()!.query(
      `INSERT INTO jebi_access_codes (code, tier, label) VALUES ($1,$2,$3) ON CONFLICT (code) DO NOTHING`,
      [code, tier, label || null],
    );
    if (rowCount === 1) return { code, tier, label };
  }
  throw new Error('Could not generate a unique code');
}

export async function listCodes() {
  await ensureTable();
  const { rows } = await getPool()!.query(
    `SELECT c.code, c.tier, c.label, c.created_at, o.ref AS used_ref, o.name AS used_by, o.item_id AS used_item
     FROM jebi_access_codes c
     LEFT JOIN jebi_shop_orders o ON o.access_code = c.code AND o.kind = 'claim' AND o.status <> 'cancelled'
     ORDER BY c.created_at DESC`,
  );
  const env = [...envCodes()].map(([code, tier]) => ({ code, tier, label: 'Starter code (Render setting)', created_at: null, used_ref: null as string | null, used_by: null as string | null, used_item: null as string | null }));
  for (const e of env) {
    const { rows: r } = await getPool()!.query(
      `SELECT ref, name, item_id FROM jebi_shop_orders WHERE access_code = $1 AND kind = 'claim' AND status <> 'cancelled' LIMIT 1`,
      [e.code],
    );
    if (r[0]) Object.assign(e, { used_ref: r[0].ref, used_by: r[0].name, used_item: r[0].item_id });
  }
  return [...rows, ...env];
}

/** Records an order atomically, refusing it if it would oversell. */
export async function placeOrder(input: {
  itemId: string;
  optionId?: string | null;
  qty: number;
  kind: OrderKind;
  tierCode?: number | null;
  accessCode?: string | null;
  name: string;
  email: string;
  phone?: string | null;
}) {
  const found = findItem(input.itemId);
  if (!found) throw new StockError('That item is not in the collection.');
  const { tier, item } = found;
  if (item.options && input.optionId && !item.options.some((o) => o.id === input.optionId)) {
    throw new StockError('Please choose a valid option.');
  }
  const optionId = item.options ? input.optionId || item.options[0].id : null;
  const unit = input.kind === 'claim' ? 0 : priceOf(tier, item, optionId);

  await ensureTable();
  const client = await getPool()!.connect();
  try {
    await client.query('BEGIN');
    // One free item per access code — lock the code so it can't be used twice at once
    if (input.kind === 'claim') {
      if (!input.accessCode) throw new StockError('An access code is required to claim.');
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`jebi:code:${input.accessCode}`]);
      const used = await codeUsedRef(input.accessCode, client);
      if (used) throw new StockError(`This access code has already been used to claim its free item (order ${used}).`);
    }
    // Serialize orders for this item so two buyers can't take the last one at once
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`jebi:${item.id}`]);
    const { rows } = await client.query(
      `SELECT COALESCE(SUM(qty),0)::int AS taken FROM jebi_shop_orders WHERE item_id = $1 AND status <> 'cancelled'`,
      [item.id],
    );
    const left = item.qty - rows[0].taken;
    if (left <= 0) throw new StockError(`${item.name} are sold out.`);
    if (input.qty > left) throw new StockError(`Only ${left} ${item.name.toLowerCase()} left — please lower the quantity.`);

    const ref = newRef();
    await client.query(
      `INSERT INTO jebi_shop_orders (ref, item_id, option_id, qty, unit_price, total, kind, tier_code, name, email, phone, access_code)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [ref, item.id, optionId, input.qty, unit, unit * input.qty, input.kind, input.tierCode ?? null, input.name, input.email, input.phone ?? null, input.kind === 'claim' ? input.accessCode : null],
    );
    await client.query('COMMIT');
    return { ref, item: item.name, option: item.options?.find((o) => o.id === optionId)?.label ?? null, qty: input.qty, unitPrice: unit, total: unit * input.qty, left: left - input.qty };
  } catch (e) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw e;
  } finally {
    client.release();
  }
}

export async function listOrders() {
  await ensureTable();
  const { rows } = await getPool()!.query(
    `SELECT ref, item_id, option_id, qty, unit_price, total, kind, tier_code, name, email, phone, status, created_at
     FROM jebi_shop_orders ORDER BY created_at DESC LIMIT 500`,
  );
  return rows;
}

export async function saveCheckout(ref: string, squareOrderId: string | null, payUrl: string) {
  await ensureTable();
  await getPool()!.query(`UPDATE jebi_shop_orders SET square_order_id = $2, pay_url = $3 WHERE ref = $1`, [ref, squareOrderId, payUrl]);
}

export async function getOrder(ref: string) {
  await ensureTable();
  const { rows } = await getPool()!.query(
    `SELECT ref, item_id, option_id, qty, total, kind, status, square_order_id, pay_url FROM jebi_shop_orders WHERE ref = $1`,
    [ref],
  );
  return (rows[0] as
    | { ref: string; item_id: string; option_id: string | null; qty: number; total: number; kind: OrderKind; status: OrderStatus; square_order_id: string | null; pay_url: string | null }
    | undefined) ?? null;
}

export async function setOrderStatus(ref: string, status: OrderStatus) {
  await ensureTable();
  const { rowCount } = await getPool()!.query(`UPDATE jebi_shop_orders SET status = $2 WHERE ref = $1`, [ref, status]);
  return rowCount === 1;
}

/** Stock report for the admin view. */
export async function stockReport() {
  const taken = storeAvailable() ? await takenByItem() : new Map<string, number>();
  const sold = new Map<string, number>();
  const claimed = new Map<string, number>();
  if (storeAvailable()) {
    const { rows } = await getPool()!.query(
      `SELECT item_id, kind, COALESCE(SUM(qty),0)::int AS n FROM jebi_shop_orders WHERE status <> 'cancelled' GROUP BY item_id, kind`,
    );
    for (const r of rows as { item_id: string; kind: string; n: number }[]) {
      (r.kind === 'claim' ? claimed : sold).set(r.item_id, r.n);
    }
  }
  const tiers = SHOP_TIERS.map((t) => {
    const items = t.items.map((i) => ({
      id: i.id,
      name: i.name,
      details: i.details,
      qty: i.qty,
      cost: i.cost,
      price: priceOf(t, i),
      options: i.options?.map((o) => ({ label: o.label, cost: o.cost, price: o.cost + t.markup })),
      sold: sold.get(i.id) ?? 0,
      claimed: claimed.get(i.id) ?? 0,
      remaining: Math.max(0, i.qty - (taken.get(i.id) ?? 0)),
      stockCost: i.qty * i.cost,
    }));
    return {
      tier: t.tier,
      name: t.name,
      markup: t.markup,
      items,
      subtotalCost: items.reduce((s, i) => s + i.stockCost, 0),
    };
  });
  return { tiers, totalCost: tiers.reduce((s, t) => s + t.subtotalCost, 0), ordersEnabled: storeAvailable() };
}
