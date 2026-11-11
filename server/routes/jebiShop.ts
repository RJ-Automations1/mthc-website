import { Router } from 'express';
import crypto from 'crypto';
import { publicCatalog, findItem, SHOP_TIERS } from '../jebi/shopCatalog';
import {
  createCode,
  listCodes,
  listOrders,
  lookupCode,
  placeOrder,
  setOrderStatus,
  stockReport,
  storeAvailable,
  takenByItem,
  StockError,
  type OrderStatus,
} from '../jebi/store';

/**
 * JEBI shop API.
 *
 *   GET  /api/jebi/shop/catalog               items, prices, options and how many are left
 *   POST /api/jebi/shop/unlock                { code } -> which tiers that access code opens
 *   POST /api/jebi/shop/order                 buy: { itemId, optionId?, qty, name, email, phone? }
 *   POST /api/jebi/shop/claim                 free sponsor claim: { itemId, optionId?, code, name, email, phone? }
 *   GET  /api/jebi/shop/inventory             stock + orders           (header x-admin-key)
 *   POST /api/jebi/shop/orders/:ref/status    { status } paid|fulfilled|cancelled|pending (x-admin-key)
 *
 * Access codes: JEBI_ACCESS_CODES="CODE:TIER,..." on Render. A code covers its
 * tier and every tier below it. Purchases are paid on MTHC's Square link; both
 * purchases and claims count against stock, and cancelling an order returns it.
 */
const router = Router();

export const PAY_URL = process.env.JEBI_PAY_URL || 'https://square.link/u/JsvQI9hw';
const MAX_PER_ORDER = 10;


const safeEqual = (a: string, b: string) => {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
};

// Per-IP throttles (codes can't be brute-forced; forms can't be spammed)
const buckets = new Map<string, { count: number; resetAt: number }>();
function throttled(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  b.count += 1;
  return b.count > limit;
}
const ipOf = (req: any) => (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const clean = (s: unknown, max: number) => String(s ?? '').trim().slice(0, max);

function readBuyer(body: any) {
  const name = clean(body?.name, 120);
  const email = clean(body?.email, 200);
  const phone = clean(body?.phone, 40) || null;
  if (!name) return { error: 'Please enter your name.' };
  if (!isEmail(email)) return { error: 'Please enter a valid email address.' };
  return { name, email, phone };
}

router.get('/catalog', async (_req, res) => {
  let taken: Map<string, number> | null = null;
  if (storeAvailable()) {
    try {
      taken = await takenByItem();
    } catch (e) {
      console.error('JEBI shop: stock lookup failed', e);
    }
  }
  const qtyOf = new Map(SHOP_TIERS.flatMap((t) => t.items.map((i) => [i.id, i.qty] as const)));
  res.json({
    tiers: publicCatalog((id) => (taken ? Math.max(0, (qtyOf.get(id) ?? 0) - (taken.get(id) ?? 0)) : null)),
    ordering: Boolean(taken),
    payUrl: PAY_URL,
  });
});

router.post('/unlock', async (req, res) => {
  if (throttled(`unlock:${ipOf(req)}`, 10, 10 * 60 * 1000)) {
    return res.status(429).json({ ok: false, message: 'Too many attempts. Please wait a few minutes and try again.' });
  }
  if (!String(req.body?.code || '').trim()) return res.status(400).json({ ok: false, message: 'Enter your access code.' });
  try {
    const found = await lookupCode(String(req.body.code));
    if (!found) return res.status(404).json({ ok: false, message: "That code wasn't recognized. Check it and try again." });
    res.json({ ok: true, tier: found.tier, unlocked: [1, 2, 3].filter((t) => t >= found.tier), used: Boolean(found.usedRef), usedRef: found.usedRef });
  } catch (e) {
    console.error('JEBI code lookup failed', e);
    res.status(500).json({ ok: false, message: 'Could not check the code right now. Please try again.' });
  }
});

async function handleOrder(req: any, res: any, kind: 'purchase' | 'claim') {
  if (throttled(`${kind}:${ipOf(req)}`, 8, 10 * 60 * 1000)) {
    return res.status(429).json({ ok: false, message: 'Too many requests. Please wait a few minutes and try again.' });
  }
  if (!storeAvailable()) return res.status(503).json({ ok: false, message: 'Ordering is not open yet. Please check back soon.' });

  const found = findItem(String(req.body?.itemId || ''));
  if (!found) return res.status(404).json({ ok: false, message: 'That item is not in the collection.' });

  const buyer = readBuyer(req.body);
  if ('error' in buyer) return res.status(400).json({ ok: false, message: buyer.error });

  let qty = kind === 'claim' ? 1 : Math.floor(Number(req.body?.qty));
  if (!Number.isFinite(qty) || qty < 1 || qty > MAX_PER_ORDER) {
    return res.status(400).json({ ok: false, message: `Choose a quantity from 1 to ${MAX_PER_ORDER}.` });
  }

  let tierCode: number | null = null;
  let accessCode: string | null = null;
  if (kind === 'claim') {
    const code = await lookupCode(String(req.body?.code || '')).catch(() => null);
    if (!code) return res.status(403).json({ ok: false, message: "That access code wasn't recognized." });
    if (code.usedRef) return res.status(409).json({ ok: false, message: `This code's free item has already been claimed (order ${code.usedRef}).` });
    if (code.tier > found.tier.tier) {
      return res.status(403).json({ ok: false, message: `Your Tier ${code.tier} code covers Tier ${code.tier}${code.tier < 3 ? ' and below' : ''} items. This item is Tier ${found.tier.tier}.` });
    }
    tierCode = code.tier;
    accessCode = code.code;
  }

  try {
    const order = await placeOrder({ itemId: found.item.id, optionId: req.body?.optionId || null, qty, kind, tierCode, accessCode, ...buyer });
    res.json({ ok: true, ...order, payUrl: kind === 'purchase' ? PAY_URL : null });
  } catch (e) {
    if (e instanceof StockError) return res.status(409).json({ ok: false, message: e.message });
    console.error('JEBI shop order failed', e);
    res.status(500).json({ ok: false, message: 'Something went wrong saving your order. Please try again.' });
  }
}

router.post('/order', (req, res) => handleOrder(req, res, 'purchase'));
router.post('/claim', (req, res) => handleOrder(req, res, 'claim'));

// ── Admin ────────────────────────────────────────────────────────────────────
function requireAdmin(req: any, res: any) {
  const key = process.env.JEBI_ADMIN_KEY || '';
  if (!key) {
    res.status(503).json({ message: 'Inventory view is not set up yet (JEBI_ADMIN_KEY missing).' });
    return false;
  }
  if (!safeEqual(String(req.headers['x-admin-key'] || ''), key)) {
    res.status(401).json({ message: 'Wrong admin key.' });
    return false;
  }
  return true;
}

router.get('/inventory', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const report = await stockReport();
    const orders = storeAvailable() ? await listOrders() : [];
    const codes = storeAvailable() ? await listCodes() : [];
    res.json({ ...report, orders, codes });
  } catch (e) {
    console.error('JEBI inventory failed', e);
    res.status(500).json({ message: 'Could not load inventory.' });
  }
});

/** Creates a personal one-item access code for a sponsor: { tier, label } */
router.post('/codes', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!storeAvailable()) return res.status(503).json({ message: 'Database not connected.' });
  const tier = Number(req.body?.tier);
  if (tier !== 1 && tier !== 2 && tier !== 3) return res.status(400).json({ message: 'Choose Tier 1, 2 or 3.' });
  try {
    res.json(await createCode(tier, clean(req.body?.label, 160)));
  } catch (e) {
    console.error('JEBI code create failed', e);
    res.status(500).json({ message: 'Could not create the code.' });
  }
});

router.post('/orders/:ref/status', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const status = String(req.body?.status || '') as OrderStatus;
  if (!['pending', 'paid', 'fulfilled', 'cancelled'].includes(status)) return res.status(400).json({ message: 'Invalid status.' });
  const ok = await setOrderStatus(String(req.params.ref), status).catch(() => false);
  if (!ok) return res.status(404).json({ message: 'Order not found.' });
  res.json({ ok: true });
});

export default router;
