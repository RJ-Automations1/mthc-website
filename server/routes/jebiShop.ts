import { Router } from 'express';
import crypto from 'crypto';
import { publicCatalog, inventoryReport } from '../jebi/shopCatalog';

/**
 * JEBI tier shop API.
 *
 *   GET  /api/jebi/shop/catalog    public tiers, items and member prices (no quantities)
 *   POST /api/jebi/shop/unlock     { code } -> which tiers that access code opens
 *   GET  /api/jebi/shop/inventory  quantities on hand + cost (header x-admin-key)
 *
 * Access codes live in the JEBI_ACCESS_CODES env var on Render, never in the
 * site's code:  JEBI_ACCESS_CODES="TITLE-7KQ2:1,PENNANT-4XM9:2,DUGOUT-9PL3:3"
 * A code opens its own tier and every tier below it (a Tier 1 code also opens
 * Tiers 2 and 3). The inventory view needs JEBI_ADMIN_KEY.
 */
const router = Router();

const normalize = (code: string) => code.trim().toUpperCase().replace(/\s+/g, '');

function loadCodes(): Map<string, 1 | 2 | 3> {
  const map = new Map<string, 1 | 2 | 3>();
  for (const entry of (process.env.JEBI_ACCESS_CODES || '').split(',')) {
    const [code, tier] = entry.split(':').map((s) => s?.trim());
    const n = Number(tier);
    if (code && (n === 1 || n === 2 || n === 3)) map.set(normalize(code), n);
  }
  return map;
}

const safeEqual = (a: string, b: string) => {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
};

// Simple per-IP throttle so codes can't be guessed by brute force.
const attempts = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 10;
const WINDOW_MS = 10 * 60 * 1000;
function throttled(ip: string) {
  const now = Date.now();
  const a = attempts.get(ip);
  if (!a || a.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  a.count += 1;
  return a.count > LIMIT;
}

router.get('/catalog', (_req, res) => {
  res.json({ tiers: publicCatalog() });
});

router.post('/unlock', (req, res) => {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';
  if (throttled(ip)) {
    return res.status(429).json({ ok: false, message: 'Too many attempts. Please wait a few minutes and try again.' });
  }
  const code = normalize(String(req.body?.code || ''));
  if (!code) return res.status(400).json({ ok: false, message: 'Enter your access code.' });

  const tier = loadCodes().get(code);
  if (!tier) return res.status(404).json({ ok: false, message: "That code wasn't recognized. Check it and try again." });

  const unlocked = [1, 2, 3].filter((t) => t >= tier);
  res.json({ ok: true, tier, unlocked });
});

router.get('/inventory', (req, res) => {
  const key = process.env.JEBI_ADMIN_KEY || '';
  const given = String(req.headers['x-admin-key'] || '');
  if (!key) return res.status(503).json({ message: 'Inventory view is not set up yet (JEBI_ADMIN_KEY missing).' });
  if (!safeEqual(given, key)) return res.status(401).json({ message: 'Wrong admin key.' });
  res.json(inventoryReport());
});

export default router;
