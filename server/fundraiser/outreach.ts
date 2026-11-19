import { db, randomChunk, storeAvailable, type Player } from './store';
import {
  OptedOutError,
  emailEnabled,
  emailFor,
  normalizePhone,
  sendEmail,
  sendSms,
  smsEnabled,
  smsFor,
  type MessageKind,
} from './messaging';

/**
 * Player outreach: players list the people they want invited; MTHC emails (and,
 * once Twilio is registered, texts) each one a personal link. Each contact's link
 * carries their ref, so a gift made through it marks that contact as donated.
 * Follow-ups go to everyone who hasn't given yet, then stop.
 *
 * Schedule (FUNDRAISER_END_DATE, default 2027-01-27):
 *   reminder 1 — 3 days after the invite
 *   reminder 2 — 10 days after the invite
 *   last chance — from 2 days before the end date
 * Messages only go out 10am–7pm Eastern, never after the end date, never to
 * anyone who donated or opted out.
 */

export const SITE_URL = (process.env.SITE_URL || 'https://mthc1867.org').replace(/\/$/, '');
const END = new Date(`${process.env.FUNDRAISER_END_DATE || '2027-01-27'}T23:59:59-05:00`);
export const endDateLabel = () => END.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'America/New_York' });
export const fundraiserOver = (now = new Date()) => now > END;
const DAY = 24 * 60 * 60 * 1000;
export const MAX_CONTACTS = 300;

export interface Contact {
  id: number;
  ref: string;
  player_id: number;
  name: string;
  email: string | null;
  phone: string | null;
  emailed_at: string | null;
  texted_at: string | null;
  sms_sent_at: string | null;
  visited_at: string | null;
  donated_at: string | null;
  followups: number;
  last_followup_at: string | null;
  last_chance_at: string | null;
  unsubscribed_at: string | null;
  send_error: string | null;
  created_at: string;
}

export const contactLink = (slug: string, ref: string) => `${SITE_URL}/fundraiser/${slug}?c=${ref}`;
const stopLink = (ref: string) => `${SITE_URL}/fundraiser/stop/${ref}`;

/** What a player sees for each contact. */
export function contactView(c: Contact, slug: string) {
  const invitedAt = c.emailed_at || c.sms_sent_at || c.texted_at;
  return {
    ref: c.ref,
    name: c.name,
    email: c.email,
    phone: c.phone,
    link: contactLink(slug, c.ref),
    emailed: Boolean(c.emailed_at),
    texted: Boolean(c.texted_at || c.sms_sent_at),
    invitedAt,
    visited: Boolean(c.visited_at),
    donated: Boolean(c.donated_at),
    followups: c.followups,
    optedOut: Boolean(c.unsubscribed_at),
    error: c.send_error,
    // Phone-only contact the player texts themselves: nudge them to send a reminder
    textReminderDue: Boolean(
      !c.donated_at && !c.unsubscribed_at && c.texted_at && !c.email && !smsEnabled() &&
        Date.now() - new Date(c.last_followup_at || c.texted_at).getTime() > 3 * DAY,
    ),
  };
}

// ── Contacts ─────────────────────────────────────────────────────────────────
export async function listContacts(playerId: number) {
  const p = await db();
  const { rows } = await p.query(`SELECT * FROM fundraiser_contacts WHERE player_id = $1 ORDER BY created_at DESC`, [playerId]);
  return rows as Contact[];
}

export class ContactError extends Error {}

export async function addContacts(playerId: number, input: { name: string; email?: string; phone?: string }[]) {
  const p = await db();
  const { rows } = await p.query(
    `SELECT COUNT(*)::int AS n, ARRAY_AGG(LOWER(email)) FILTER (WHERE email IS NOT NULL) AS emails,
            ARRAY_AGG(phone) FILTER (WHERE phone IS NOT NULL) AS phones
     FROM fundraiser_contacts WHERE player_id = $1`,
    [playerId],
  );
  let count: number = rows[0].n;
  const emails = new Set<string>(rows[0].emails ?? []);
  const phones = new Set<string>(rows[0].phones ?? []);
  const added: string[] = [];
  const skipped: string[] = [];
  for (const raw of input) {
    const name = String(raw.name ?? '').trim().slice(0, 120);
    const email = String(raw.email ?? '').trim().toLowerCase().slice(0, 200) || null;
    const phoneRaw = String(raw.phone ?? '').trim();
    const phone = phoneRaw ? normalizePhone(phoneRaw) : null;
    if (!name) continue;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { skipped.push(`${name} (email doesn't look right)`); continue; }
    if (phoneRaw && !phone) { skipped.push(`${name} (phone needs 10 digits)`); continue; }
    if (!email && !phone) { skipped.push(`${name} (needs an email or phone)`); continue; }
    if ((email && emails.has(email)) || (phone && phones.has(phone))) { skipped.push(`${name} (already on your list)`); continue; }
    if (count >= MAX_CONTACTS) throw new ContactError(`You can invite up to ${MAX_CONTACTS} people.`);
    await p.query(
      `INSERT INTO fundraiser_contacts (ref, player_id, name, email, phone) VALUES ($1,$2,$3,$4,$5)`,
      [randomChunk(10), playerId, name, email, phone],
    );
    if (email) emails.add(email);
    if (phone) phones.add(phone);
    count++;
    added.push(name);
  }
  return { added, skipped };
}

export async function removeContact(playerId: number, ref: string) {
  const p = await db();
  await p.query(`DELETE FROM fundraiser_contacts WHERE player_id = $1 AND ref = $2 AND donated_at IS NULL`, [playerId, ref]);
}

export async function getContact(ref: string) {
  const p = await db();
  const { rows } = await p.query(`SELECT * FROM fundraiser_contacts WHERE ref = $1`, [ref]);
  return (rows[0] as Contact | undefined) ?? null;
}

export async function markVisited(ref: string) {
  const p = await db();
  await p.query(`UPDATE fundraiser_contacts SET visited_at = COALESCE(visited_at, now()) WHERE ref = $1`, [ref]);
}

/** Player tapped "Text" — they sent it from their own phone. */
export async function markTexted(playerId: number, ref: string) {
  const p = await db();
  await p.query(
    `UPDATE fundraiser_contacts
       SET texted_at = COALESCE(texted_at, now()),
           last_followup_at = CASE WHEN texted_at IS NOT NULL THEN now() ELSE last_followup_at END
     WHERE player_id = $1 AND ref = $2`,
    [playerId, ref],
  );
}

export async function unsubscribe(ref: string) {
  const p = await db();
  const { rowCount } = await p.query(`UPDATE fundraiser_contacts SET unsubscribed_at = COALESCE(unsubscribed_at, now()) WHERE ref = $1`, [ref]);
  return rowCount === 1;
}

// ── Sending ──────────────────────────────────────────────────────────────────
function messageFor(kind: MessageKind, c: Contact, player: Player) {
  return {
    kind,
    contactName: c.name,
    playerName: player.name,
    playerNumber: player.number,
    playerPhoto: player.photo,
    personalNote: player.blurb,
    link: contactLink(player.slug, c.ref),
    unsubscribeUrl: stopLink(c.ref),
    endDate: endDateLabel(),
  };
}

/** Sends one message on every automated channel the contact has. Returns channels used. */
async function deliver(kind: MessageKind, c: Contact, player: Player) {
  const p = await db();
  const m = messageFor(kind, c, player);
  const used: string[] = [];
  const errors: string[] = [];
  if (c.email && emailEnabled()) {
    try {
      const e = emailFor(m);
      await sendEmail({ to: c.email, ...e, unsubscribeUrl: m.unsubscribeUrl });
      used.push('email');
    } catch (err: any) {
      errors.push(`Email: ${String(err?.message || err).slice(0, 120)}`);
    }
  }
  if (c.phone && smsEnabled()) {
    try {
      await sendSms(c.phone, smsFor(m, true));
      used.push('sms');
    } catch (err: any) {
      if (err instanceof OptedOutError) await unsubscribe(c.ref);
      else errors.push(`Text: ${String(err?.message || err).slice(0, 120)}`);
    }
  }
  await p.query(`UPDATE fundraiser_contacts SET send_error = $2 WHERE id = $1`, [c.id, errors.join(' · ') || null]);
  return used;
}

/** Invites every contact this player hasn't invited yet by email/automated text. */
export async function sendInvites(player: Player) {
  if (fundraiserOver()) return { sent: 0, waiting: 0, message: 'The fundraiser has ended.' };
  const p = await db();
  const { rows } = await p.query(
    `SELECT * FROM fundraiser_contacts
     WHERE player_id = $1 AND unsubscribed_at IS NULL AND donated_at IS NULL
       AND ((email IS NOT NULL AND emailed_at IS NULL) OR (phone IS NOT NULL AND sms_sent_at IS NULL))`,
    [player.id],
  );
  let sent = 0;
  let waiting = 0;
  for (const c of rows as Contact[]) {
    const needsEmail = c.email && !c.emailed_at;
    const needsSms = c.phone && !c.sms_sent_at;
    const canEmail = needsEmail && emailEnabled();
    const canSms = needsSms && smsEnabled();
    if (!canEmail && !canSms) {
      waiting++;
      continue;
    }
    const used = await deliver('invite', { ...c, email: canEmail ? c.email : null, phone: canSms ? c.phone : null }, player);
    if (used.includes('email')) await p.query(`UPDATE fundraiser_contacts SET emailed_at = now() WHERE id = $1`, [c.id]);
    if (used.includes('sms')) await p.query(`UPDATE fundraiser_contacts SET sms_sent_at = now() WHERE id = $1`, [c.id]);
    if (used.length) sent++;
  }
  return { sent, waiting };
}

const easternHour = (d: Date) => Number(d.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'America/New_York' }));

/** Sends whatever follow-ups are due. Safe to run as often as you like. */
export async function runFollowUps(now = new Date(), opts: { ignoreQuietHours?: boolean } = {}) {
  if (!storeAvailable() || fundraiserOver(now)) return { sent: 0 };
  if (!emailEnabled() && !smsEnabled()) return { sent: 0 };
  const hour = easternHour(now);
  if (!opts.ignoreQuietHours && (hour < 10 || hour >= 19)) return { sent: 0 };
  const p = await db();
  const lastChanceWindow = now.getTime() >= END.getTime() - 2 * DAY;
  const { rows } = await p.query(
    `SELECT c.*, row_to_json(pl.*) AS player FROM fundraiser_contacts c JOIN fundraiser_players pl ON pl.id = c.player_id
     WHERE c.donated_at IS NULL AND c.unsubscribed_at IS NULL
       AND (c.emailed_at IS NOT NULL OR c.sms_sent_at IS NOT NULL)`,
  );
  let sent = 0;
  for (const row of rows as (Contact & { player: Player })[]) {
    const invited = new Date(row.emailed_at || row.sms_sent_at!).getTime();
    const last = row.last_followup_at ? new Date(row.last_followup_at).getTime() : 0;
    const sinceLast = now.getTime() - Math.max(invited, last);
    let kind: MessageKind | null = null;
    if (lastChanceWindow) {
      if (!row.last_chance_at && sinceLast > DAY) kind = 'last-chance';
    } else if (row.followups === 0 && now.getTime() - invited >= 3 * DAY) kind = 'reminder';
    else if (row.followups === 1 && now.getTime() - invited >= 10 * DAY) kind = 'reminder';
    if (!kind) continue;
    // Only follow up on the channels they were actually invited on
    const c = { ...row, email: row.emailed_at ? row.email : null, phone: row.sms_sent_at ? row.phone : null };
    const used = await deliver(kind, c, row.player);
    if (!used.length) continue;
    await p.query(
      `UPDATE fundraiser_contacts SET followups = followups + 1, last_followup_at = now(),
         last_chance_at = CASE WHEN $2 THEN now() ELSE last_chance_at END WHERE id = $1`,
      [row.id, kind === 'last-chance'],
    );
    sent++;
  }
  if (sent) console.log(`Fundraiser follow-ups sent: ${sent}`);
  return { sent };
}

let timer: NodeJS.Timeout | null = null;
/** Checks for due follow-ups every 30 minutes while the server runs. */
export function startFollowUpScheduler() {
  if (timer || !storeAvailable()) return;
  const tick = () => runFollowUps().catch((e) => console.error('Fundraiser follow-ups failed', e));
  timer = setInterval(tick, 30 * 60 * 1000);
  setTimeout(tick, 60 * 1000);
}

// ── When a gift is paid ──────────────────────────────────────────────────────
/** Marks the matching contact as donated and lets the player know they got an envelope. */
export async function onGiftPaid(ref: string) {
  const p = await db();
  const { rows } = await p.query(
    `SELECT g.*, row_to_json(pl.*) AS player FROM fundraiser_gifts g JOIN fundraiser_players pl ON pl.id = g.player_id WHERE g.ref = $1`,
    [ref.toUpperCase()],
  );
  const g = rows[0] as { contact_id: number | null; donor_email: string; donor_name: string; anonymous: boolean; amount: number; player_id: number; player: Player } | undefined;
  if (!g) return;
  if (g.contact_id) {
    await p.query(`UPDATE fundraiser_contacts SET donated_at = COALESCE(donated_at, now()) WHERE id = $1`, [g.contact_id]);
  } else {
    await p.query(
      `UPDATE fundraiser_contacts SET donated_at = COALESCE(donated_at, now()) WHERE player_id = $1 AND LOWER(email) = LOWER($2)`,
      [g.player_id, g.donor_email],
    );
  }
  const player = g.player;
  if (player.email && emailEnabled()) {
    const from = g.anonymous ? 'A secret supporter' : g.donor_name;
    const first = player.name.split(/\s+/)[0];
    sendEmail({
      to: player.email,
      subject: `You got a new envelope from ${from}!`,
      text: `${first}, ${from} just gave to Morehouse Baseball in your name and left you a note. Open it here: ${SITE_URL}/fundraiser/players`,
      html: `<p style="font-family:Arial,sans-serif;font-size:16px">${first}, <strong>${from.replace(/[<>&]/g, '')}</strong> just gave to Morehouse Baseball in your name and left you a note.</p>
<p><a href="${SITE_URL}/fundraiser/players" style="display:inline-block;background:#7a1d2d;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold">Open my envelope</a></p>`,
    }).catch((e) => console.error('Player envelope email failed', e));
  }
}

/** Outreach numbers per player for the admin page. */
export async function outreachReport() {
  const p = await db();
  const { rows } = await p.query(
    `SELECT player_id,
            COUNT(*)::int AS contacts,
            COUNT(*) FILTER (WHERE emailed_at IS NOT NULL OR sms_sent_at IS NOT NULL OR texted_at IS NOT NULL)::int AS invited,
            COUNT(*) FILTER (WHERE visited_at IS NOT NULL)::int AS visited,
            COUNT(*) FILTER (WHERE donated_at IS NOT NULL)::int AS donated,
            COUNT(*) FILTER (WHERE unsubscribed_at IS NOT NULL)::int AS opted_out
     FROM fundraiser_contacts GROUP BY player_id`,
  );
  return new Map(rows.map((r: any) => [r.player_id as number, r]));
}

export async function allContactsForExport() {
  const p = await db();
  const { rows } = await p.query(
    `SELECT pl.name AS player, c.name, c.email, c.phone, c.emailed_at, c.texted_at, c.sms_sent_at, c.visited_at,
            c.donated_at, c.followups, c.unsubscribed_at, c.send_error, c.created_at
     FROM fundraiser_contacts c JOIN fundraiser_players pl ON pl.id = c.player_id ORDER BY pl.name, c.created_at`,
  );
  return rows;
}
