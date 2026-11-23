import { Router } from 'express';
import crypto from 'crypto';
import { createCheckout, isPaid, squareEnabled } from '../jebi/squareCheckout';
import {
  adminReport,
  createGift,
  createPlayer,
  deletePlayer,
  getGift,
  getPlayer,
  inbox,
  markOpened,
  pendingGifts,
  playerTotals,
  recentSupporters,
  resetPortalKey,
  saveGiftCheckout,
  setGiftStatus,
  storeAvailable,
  updatePlayer,
  setAllGoals,
  DEFAULT_GOAL,
  type GiftStatus,
  clearPin,
  pinMatches,
  rosterWithTotals,
  setFirstPin,
} from '../fundraiser/store';
import {
  ContactError,
  addContacts,
  allContactsForExport,
  contactView,
  endDateLabel,
  fundraiserOver,
  getContact,
  listContacts,
  markTexted,
  markVisited,
  onGiftPaid,
  outreachReport,
  removeContact,
  runFollowUps,
  sendInvites,
  unsubscribe,
} from '../fundraiser/outreach';
import { emailConfigured, emailEnabled, greetName, sendingOn, smsConfigured, smsEnabled } from '../fundraiser/messaging';

/**
 * Player fundraiser API.
 *
 *   GET  /api/fundraiser/roster                  every player (2026 roster, preloaded) with totals
 *   GET  /api/fundraiser/p/:slug                 public invite page data (name, goal, raised, supporters)
 *   POST /api/fundraiser/p/:slug/give            donor: { amount, name, email, note?, anonymous? } -> Square checkout URL
 *   GET  /api/fundraiser/gifts/:ref              donor's return page: confirms payment with Square
 *   GET  /api/fundraiser/inbox/:slug             player's envelopes            (header x-portal-key)
 *   POST /api/fundraiser/inbox/:slug/open/:ref   mark an envelope opened       (x-portal-key)
 *   PATCH /api/fundraiser/inbox/:slug            player edits note/email       (x-portal-key)
 *   GET  /api/fundraiser/admin                   every player + gift           (x-admin-key)
 *   POST /api/fundraiser/admin/players           add a player                  (x-admin-key)
 *   POST /api/fundraiser/admin/players/:slug/reset-key | DELETE …/players/:slug
 *   POST /api/fundraiser/admin/gifts/:ref/status { status }                    (x-admin-key)
 *   POST /api/fundraiser/admin/sync              re-check Square for pending gifts
 *
 * Render env:
 *   FUNDRAISER_DEFAULT_GOAL starting goal for roster players (default 2000)
 *   FUNDRAISER_ADMIN_KEY   admin password (falls back to JEBI_ADMIN_KEY)
 *   SQUARE_ACCESS_TOKEN + SQUARE_LOCATION_ID — already set for the JEBI shop; gives
 *   every gift an exact-amount Square checkout. Without them donors use the static
 *   MTHC Square link and an admin marks each gift paid.
 */
const router = Router();

export const STATIC_PAY_URL = process.env.FUNDRAISER_PAY_URL || 'https://square.link/u/JsvQI9hw';
const MIN_GIFT = 5;
const MAX_GIFT = 10000;

const safeEqual = (a: string, b: string) => {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
};

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
const siteOrigin = (req: any) => {
  const proto = String(req.headers['x-forwarded-proto'] || req.protocol || 'https').split(',')[0];
  return `${proto}://${req.get('host')}`;
};
const wholeDollars = (v: unknown) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? n : NaN;
};

function noDb(res: any) {
  if (storeAvailable()) return false;
  res.status(503).json({ message: 'The fundraiser is not open yet. Please check back soon.' });
  return true;
}

const linksFor = (req: any, slug: string, key: string) => ({
  shareUrl: `${siteOrigin(req)}/fundraiser/${slug}`,
  inboxUrl: `${siteOrigin(req)}/fundraiser/${slug}/inbox?key=${encodeURIComponent(key)}`,
});

// ── Roster ─────────────────────────────────────────────────────
router.get('/roster', async (_req, res) => {
  if (noDb(res)) return;
  try {
    res.json({ players: await rosterWithTotals() });
  } catch (e) {
    console.error('Fundraiser roster failed', e);
    res.status(500).json({ message: 'Could not load the roster.' });
  }
});

// ── Public invite page ───────────────────────────────────────────────────────
router.get('/p/:slug', async (req, res) => {
  if (noDb(res)) return;
  try {
    const player = await getPlayer(String(req.params.slug));
    if (!player) return res.status(404).json({ message: 'We couldn’t find that fundraiser link.' });
    const [totals, supporters] = await Promise.all([playerTotals(player.id), recentSupporters(player.id)]);
    res.json({ name: player.name, slug: player.slug, blurb: player.blurb, goal: player.goal, number: player.number, position: player.position, photo: player.photo, ...totals, supporters });
  } catch (e) {
    console.error('Fundraiser page failed', e);
    res.status(500).json({ message: 'Could not load this page.' });
  }
});

router.post('/p/:slug/give', async (req, res) => {
  if (noDb(res)) return;
  if (throttled(`give:${ipOf(req)}`, 10, 10 * 60 * 1000)) {
    return res.status(429).json({ message: 'Too many requests. Please wait a few minutes and try again.' });
  }
  const amount = wholeDollars(req.body?.amount);
  if (!(amount >= MIN_GIFT && amount <= MAX_GIFT)) {
    return res.status(400).json({ message: `Choose an amount from $${MIN_GIFT} to $${MAX_GIFT.toLocaleString()}.` });
  }
  const name = clean(req.body?.name, 120);
  const email = clean(req.body?.email, 200);
  if (!name) return res.status(400).json({ message: 'Please enter your name.' });
  if (!isEmail(email)) return res.status(400).json({ message: 'Please enter a valid email for your receipt.' });
  const note = clean(req.body?.note, 600) || null;
  const anonymous = Boolean(req.body?.anonymous);

  try {
    const player = await getPlayer(String(req.params.slug));
    if (!player) return res.status(404).json({ message: 'We couldn’t find that fundraiser link.' });
    const contactRef = clean(req.body?.contact, 16);
    const contact = contactRef ? await getContact(contactRef).catch(() => null) : null;
    const contactId = contact && contact.player_id === player.id ? contact.id : null;
    const ref = await createGift({ playerId: player.id, amount, donorName: name, donorEmail: email, note, anonymous, contactId });

    let payUrl = STATIC_PAY_URL;
    let exactAmount = false;
    if (squareEnabled()) {
      try {
        const checkout = await createCheckout({
          ref,
          title: `MTHC Fundraiser — gift for ${player.name}`,
          totalDollars: amount,
          email,
          returnUrl: `${siteOrigin(req)}/fundraiser/${player.slug}/thanks/${ref}`,
          note: `MTHC fundraiser gift ${ref} for ${player.name}`,
        });
        await saveGiftCheckout(ref, checkout.squareOrderId, checkout.url);
        payUrl = checkout.url;
        exactAmount = true;
      } catch (e) {
        console.error('Fundraiser Square checkout failed — using the static Square link', e);
      }
    }
    res.json({ ok: true, ref, amount, payUrl, exactAmount });
  } catch (e) {
    console.error('Fundraiser gift failed', e);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

/** Marks a gift paid once Square shows it paid. */
async function syncGift(ref: string) {
  const g = await getGift(ref);
  if (!g) return null;
  if (g.status === 'pending' && g.square_order_id && squareEnabled()) {
    if (await isPaid(g.square_order_id, g.amount).catch(() => false)) {
      await setGiftStatus(g.ref, 'paid');
      g.status = 'paid';
      await onGiftPaid(g.ref).catch((e) => console.error('Gift follow-through failed', e));
    }
  }
  return g;
}

router.get('/gifts/:ref', async (req, res) => {
  if (noDb(res)) return;
  if (throttled(`gift:${ipOf(req)}`, 60, 10 * 60 * 1000)) return res.status(429).json({ message: 'Too many requests.' });
  const g = await syncGift(String(req.params.ref)).catch(() => null);
  if (!g) return res.status(404).json({ message: 'Gift not found.' });
  res.json({ ref: g.ref, status: g.status, paid: g.status === 'paid', amount: g.amount, payUrl: g.pay_url, exactAmount: Boolean(g.square_order_id) });
});

// ── Player's private inbox ───────────────────────────────────────────────────
async function requirePlayer(req: any, res: any) {
  if (noDb(res)) return null;
  if (throttled(`inbox:${ipOf(req)}`, 120, 10 * 60 * 1000)) {
    res.status(429).json({ message: 'Too many requests. Please wait a few minutes.' });
    return null;
  }
  const player = await getPlayer(String(req.params.slug)).catch(() => null);
  const key = String(req.headers['x-portal-key'] || '');
  if (!player || !key || !safeEqual(key, player.portal_key)) {
    res.status(401).json({ message: 'This private link isn’t valid. Ask your coach for a new one.' });
    return null;
  }
  return player;
}

router.get('/inbox/:slug', async (req, res) => {
  const player = await requirePlayer(req, res);
  if (!player) return;
  try {
    const [gifts, totals] = await Promise.all([inbox(player.id), playerTotals(player.id)]);
    res.json({
      name: player.name,
      slug: player.slug,
      goal: player.goal,
      blurb: player.blurb,
      email: player.email,
      number: player.number,
      ...totals,
      emailEnabled: emailEnabled(),
      smsEnabled: smsEnabled(),
      endDate: endDateLabel(),
      over: fundraiserOver(),
      contacts: (await listContacts(player.id)).map((c) => contactView(c, player.slug)),
      shareUrl: `${siteOrigin(req)}/fundraiser/${player.slug}`,
      envelopes: gifts.map((g) => ({
        ref: g.ref,
        amount: g.amount,
        from: g.anonymous ? 'A secret supporter' : g.donor_name,
        note: g.note,
        opened: Boolean(g.opened_at),
        createdAt: g.created_at,
      })),
    });
  } catch (e) {
    console.error('Fundraiser inbox failed', e);
    res.status(500).json({ message: 'Could not load your envelopes.' });
  }
});

router.post('/inbox/:slug/open/:ref', async (req, res) => {
  const player = await requirePlayer(req, res);
  if (!player) return;
  await markOpened(player.id, String(req.params.ref)).catch(() => undefined);
  res.json({ ok: true });
});

router.patch('/inbox/:slug', async (req, res) => {
  const player = await requirePlayer(req, res);
  if (!player) return;
  // Goals are set by MTHC (admin) — players can't change theirs.
  const blurb = req.body?.blurb === undefined ? undefined : clean(req.body.blurb, 400);
  const email = req.body?.email === undefined ? undefined : clean(req.body.email, 200).toLowerCase();
  if (email && !isEmail(email)) return res.status(400).json({ message: 'That email address doesn’t look right.' });
  await updatePlayer(player.id, { blurb, email });
  res.json({ ok: true });
});

// ── Player outreach (contacts they want invited) ─────────────────────────────
router.post('/inbox/:slug/contacts', async (req, res) => {
  const player = await requirePlayer(req, res);
  if (!player) return;
  const list = Array.isArray(req.body?.contacts) ? req.body.contacts.slice(0, 300) : [];
  if (!list.length) return res.status(400).json({ message: 'Add at least one person.' });
  try {
    res.json({ ok: true, ...(await addContacts(player.id, list, req.body?.smsConsent === true)) });
  } catch (e) {
    if (e instanceof ContactError) return res.status(400).json({ message: e.message });
    console.error('Add contacts failed', e);
    res.status(500).json({ message: 'Could not save your list. Please try again.' });
  }
});

router.delete('/inbox/:slug/contacts/:ref', async (req, res) => {
  const player = await requirePlayer(req, res);
  if (!player) return;
  await removeContact(player.id, String(req.params.ref)).catch(() => undefined);
  res.json({ ok: true });
});

router.post('/inbox/:slug/contacts/:ref/texted', async (req, res) => {
  const player = await requirePlayer(req, res);
  if (!player) return;
  await markTexted(player.id, String(req.params.ref)).catch(() => undefined);
  res.json({ ok: true });
});

router.post('/inbox/:slug/send-invites', async (req, res) => {
  const player = await requirePlayer(req, res);
  if (!player) return;
  if (throttled(`invite:${player.id}`, 6, 60 * 60 * 1000)) return res.status(429).json({ message: 'Please wait a bit before sending again.' });
  try {
    res.json({ ok: true, ...(await sendInvites(player)) });
  } catch (e) {
    console.error('Send invites failed', e);
    res.status(500).json({ message: 'Could not send invitations. Please try again.' });
  }
});

// ── Player sign-in: pick your name, then your PIN (set it the first time) ────
router.get('/players', async (_req, res) => {
  if (noDb(res)) return;
  try {
    const players = await rosterWithTotals();
    res.json({ players: players.map((p: any) => ({ slug: p.slug, name: p.name, number: p.number, photo: p.photo })) });
  } catch (e) {
    console.error('Player list failed', e);
    res.status(500).json({ message: 'Could not load the team.' });
  }
});

router.post('/players/status', async (req, res) => {
  if (noDb(res)) return;
  const player = await getPlayer(clean(req.body?.slug, 60)).catch(() => null);
  if (!player) return res.status(404).json({ message: 'Pick your name from the list.' });
  res.json({ hasPin: Boolean(player.pin_hash), name: player.name });
});

router.post('/players/login', async (req, res) => {
  if (noDb(res)) return;
  const slug = clean(req.body?.slug, 60);
  if (throttled(`login:${ipOf(req)}`, 15, 15 * 60 * 1000) || throttled(`login:${slug}`, 8, 15 * 60 * 1000)) {
    return res.status(429).json({ message: 'Too many tries. Wait 15 minutes, or ask your coach to reset your PIN.' });
  }
  const pin = clean(req.body?.pin, 10);
  if (!/^\d{4,6}$/.test(pin)) return res.status(400).json({ message: 'Your PIN is 4 to 6 numbers.' });
  const player = await getPlayer(slug).catch(() => null);
  if (!player) return res.status(404).json({ message: 'Pick your name from the list.' });
  if (!player.pin_hash) {
    if (!(await setFirstPin(player.id, pin))) return res.status(409).json({ message: 'A PIN was just set for this name. Enter it, or ask your coach to reset it.' });
  } else if (!pinMatches(pin, player.pin_hash)) {
    return res.status(401).json({ message: 'That PIN isn’t right. Ask your coach to reset it if you forgot.' });
  }
  res.json({ ok: true, slug: player.slug, key: player.portal_key });
});

// ── Contact link tracking + opt-out (public) ─────────────────────────────────
router.post('/c/:ref/visit', async (req, res) => {
  if (noDb(res)) return;
  if (throttled(`visit:${ipOf(req)}`, 60, 10 * 60 * 1000)) return res.status(429).json({});
  const c = await getContact(String(req.params.ref)).catch(() => null);
  if (!c) return res.status(404).json({});
  await markVisited(c.ref).catch(() => undefined);
  res.json({ ok: true, firstName: greetName(c.name) });
});

router.post('/stop/:ref', async (req, res) => {
  if (noDb(res)) return;
  const ok = await unsubscribe(String(req.params.ref)).catch(() => false);
  if (!ok) return res.status(404).json({ message: 'Link not found.' });
  res.json({ ok: true });
});

// ── Admin ────────────────────────────────────────────────────────────────────
function requireAdmin(req: any, res: any) {
  const key = process.env.FUNDRAISER_ADMIN_KEY || process.env.JEBI_ADMIN_KEY || '';
  if (!key) {
    res.status(503).json({ message: 'Admin view is not set up yet (FUNDRAISER_ADMIN_KEY missing).' });
    return false;
  }
  if (!safeEqual(String(req.headers['x-admin-key'] || ''), key)) {
    res.status(401).json({ message: 'Wrong admin key.' });
    return false;
  }
  return !noDb(res);
}

router.get('/admin', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const [report, outreach] = await Promise.all([adminReport(), outreachReport()]);
    const origin = siteOrigin(req);
    res.json({
      squareConnected: squareEnabled(),
      emailEnabled: emailEnabled(),
      smsEnabled: smsEnabled(),
      sendingOn: sendingOn(),
      emailConfigured: emailConfigured(),
      smsConfigured: smsConfigured(),
      endDate: endDateLabel(),
      players: report.players.map((p: any) => ({
        slug: p.slug,
        name: p.name,
        email: p.email,
        number: p.number,
        goal: p.goal,
        raised: p.raised,
        gifts: p.gifts,
        pending: p.pending,
        hasPin: Boolean(p.pin_hash),
        outreach: outreach.get(p.id) ?? { contacts: 0, invited: 0, visited: 0, donated: 0, opted_out: 0 },
        shareUrl: `${origin}/fundraiser/${p.slug}`,
        inboxUrl: `${origin}/fundraiser/${p.slug}/inbox?key=${encodeURIComponent(p.portal_key)}`,
      })),
      gifts: report.gifts,
    });
  } catch (e) {
    console.error('Fundraiser admin failed', e);
    res.status(500).json({ message: 'Could not load the fundraiser.' });
  }
});

router.post('/admin/players', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const name = clean(req.body?.name, 120);
  if (name.length < 2) return res.status(400).json({ message: 'Enter the player’s name.' });
  const goal = wholeDollars(req.body?.goal || DEFAULT_GOAL);
  if (!(goal >= 50 && goal <= 100000)) return res.status(400).json({ message: 'Pick a goal between $50 and $100,000.' });
  const player = await createPlayer({ name, goal, email: clean(req.body?.email, 200) || null, blurb: clean(req.body?.blurb, 400) || null });
  res.status(201).json({ ok: true, slug: player.slug, ...linksFor(req, player.slug, player.portal_key) });
});

// Set every player's goal at once
router.post('/admin/goals', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const goal = wholeDollars(req.body?.goal);
  if (!(goal >= 50 && goal <= 100000)) return res.status(400).json({ message: 'Pick a goal between $50 and $100,000.' });
  res.json({ ok: true, goal, updated: await setAllGoals(goal) });
});

router.post('/admin/players/:slug/reset-key', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const player = await getPlayer(String(req.params.slug));
  if (!player) return res.status(404).json({ message: 'Player not found.' });
  const key = await resetPortalKey(player.id);
  res.json({ ok: true, ...linksFor(req, player.slug, key) });
});

router.post('/admin/players/:slug/reset-pin', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const player = await getPlayer(String(req.params.slug));
  if (!player) return res.status(404).json({ message: 'Player not found.' });
  await clearPin(player.id);
  res.json({ ok: true });
});

router.get('/admin/contacts', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  res.json({ contacts: await allContactsForExport() });
});

router.post('/admin/followups/run', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!sendingOn()) return res.status(503).json({ message: 'Sending is OFF (FUNDRAISER_SENDING is not "on"). Nothing was sent.' });
  if (!emailEnabled() && !smsEnabled()) return res.status(503).json({ message: 'Email and texting are not set up yet.' });
  res.json({ ok: true, ...(await runFollowUps(new Date(), { ignoreQuietHours: true })) });
});

router.delete('/admin/players/:slug', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const player = await getPlayer(String(req.params.slug));
  if (!player) return res.status(404).json({ message: 'Player not found.' });
  await deletePlayer(player.id);
  res.json({ ok: true });
});

router.post('/admin/gifts/:ref/status', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const status = String(req.body?.status || '') as GiftStatus;
  if (!['pending', 'paid', 'cancelled'].includes(status)) return res.status(400).json({ message: 'Invalid status.' });
  const before = await getGift(String(req.params.ref)).catch(() => null);
  const ok = await setGiftStatus(String(req.params.ref), status).catch(() => false);
  if (!ok) return res.status(404).json({ message: 'Gift not found.' });
  if (status === 'paid' && before?.status !== 'paid') await onGiftPaid(String(req.params.ref)).catch((e) => console.error('Gift follow-through failed', e));
  res.json({ ok: true });
});

router.post('/admin/sync', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!squareEnabled()) return res.status(503).json({ message: 'Square is not connected (SQUARE_ACCESS_TOKEN / SQUARE_LOCATION_ID).' });
  const refs = await pendingGifts();
  let marked = 0;
  for (const ref of refs) {
    const g = await syncGift(ref).catch(() => null);
    if (g?.status === 'paid') marked++;
  }
  res.json({ ok: true, checked: refs.length, marked });
});

export default router;
