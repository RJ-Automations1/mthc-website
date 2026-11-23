import nodemailer from 'nodemailer';

/**
 * Emails every new JEBI shop order (purchase or sponsor claim) to the
 * addresses in JEBI_ORDER_EMAIL, so it can be forwarded to whoever makes
 * and ships the merchandise.
 *
 * Uses the same mail settings as the rest of the site: RESEND_API_KEY, or
 * SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS (e.g. Gmail + app password).
 * MAIL_FROM sets the sender. Unlike fundraiser mail, this does not depend on
 * FUNDRAISER_SENDING — it only needs JEBI_ORDER_EMAIL and a mail provider.
 */

const recipients = () =>
  (process.env.JEBI_ORDER_EMAIL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const providerConfigured = () => Boolean(process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER));
export const orderEmailEnabled = () => recipients().length > 0 && providerConfigured();

const mailFrom = () => process.env.MAIL_FROM || process.env.SMTP_USER || 'JEBI Shop <shop@mthc1867.org>';

let transport: nodemailer.Transporter | null = null;
function smtp() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT) || 465;
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transport;
}

export interface OrderEmailData {
  ref: string;
  kind: 'purchase' | 'claim';
  tier: number;
  item: string;
  option: string | null;
  color: string | null;
  size: string | null;
  qty: number;
  unitPrice: number;
  total: number;
  left: number;
  accessCode: string | null;
  exactAmount: boolean; // true = paid through a pre-filled Square checkout
  name: string;
  email: string;
  phone: string | null;
  ship: { line1: string; line2: string | null; city: string; state: string; zip: string };
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const money = (n: number) => `$${n.toLocaleString('en-US')}`;

export function buildOrderEmail(o: OrderEmailData) {
  const isClaim = o.kind === 'claim';
  const what = `${o.qty} × ${o.item}`;
  const subject = `JEBI ${isClaim ? 'sponsor claim' : 'order'} ${o.ref}: ${what}${o.size ? ` (${o.size})` : ''} for ${o.name}`;
  const payment = isClaim
    ? `Free sponsor item (Tier ${o.tier} access code ${o.accessCode}) — no payment`
    : o.exactAmount
      ? `${money(o.total)} — buyer was sent to a Square checkout for this exact amount. Confirm it shows as paid on /shop/inventory before shipping.`
      : `${money(o.total)} — buyer pays on the MTHC Square link and was asked to put ${o.ref} in the note. Confirm the payment in Square before shipping.`;

  const rows: [string, string][] = [
    ['Order #', o.ref],
    ['Type', isClaim ? 'Sponsor claim' : 'Purchase'],
    ['Item', `${o.item} (Tier ${o.tier})`],
    ...(o.option ? ([['Style', o.option]] as [string, string][]) : []),
    ...(o.color ? ([['Color', o.color]] as [string, string][]) : []),
    ...(o.size ? ([['Size', o.size]] as [string, string][]) : []),
    ['Quantity', String(o.qty)],
    ...(isClaim ? [] : ([['Price each', money(o.unitPrice)]] as [string, string][])),
    ['Payment', payment],
    ['Stock left after this order', String(o.left)],
  ];
  const addressLines = [o.name, o.ship.line1, o.ship.line2, `${o.ship.city}, ${o.ship.state} ${o.ship.zip}`].filter(Boolean) as string[];
  const contact = [o.email, o.phone].filter(Boolean) as string[];

  const text = [
    `New JEBI ${isClaim ? 'sponsor claim' : 'order'} — please make and ship.`,
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    'SHIP TO',
    ...addressLines,
    '',
    'CUSTOMER CONTACT',
    ...contact,
  ].join('\n');

  const td = 'padding:6px 12px;border-bottom:1px solid #eee;vertical-align:top';
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#111;max-width:560px">
  <h2 style="margin:0 0 4px;color:#6b1426">New JEBI ${isClaim ? 'sponsor claim' : 'order'}: ${esc(o.ref)}</h2>
  <p style="margin:0 0 16px;color:#555">Jay Edwards Baseball Invitational shop — please make and ship.</p>
  <table style="border-collapse:collapse;width:100%">
    ${rows.map(([k, v]) => `<tr><td style="${td};color:#555;white-space:nowrap">${esc(k)}</td><td style="${td};font-weight:bold">${esc(v)}</td></tr>`).join('')}
  </table>
  <h3 style="margin:20px 0 6px;color:#6b1426">Ship to</h3>
  <p style="margin:0;line-height:1.5">${addressLines.map(esc).join('<br>')}</p>
  <h3 style="margin:20px 0 6px;color:#6b1426">Customer contact</h3>
  <p style="margin:0;line-height:1.5">${contact.map(esc).join('<br>')}</p>
</div>`;

  return { subject, text, html };
}

/** Sends the order email. Never throws — a mail problem must not break an order. */
export async function sendOrderEmail(o: OrderEmailData) {
  if (!orderEmailEnabled()) return;
  const { subject, text, html } = buildOrderEmail(o);
  const to = recipients();
  try {
    if (process.env.RESEND_API_KEY) {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: mailFrom(), to, subject, html, text, reply_to: o.email }),
      });
      if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 200)}`);
    } else {
      await smtp().sendMail({ from: mailFrom(), to, replyTo: o.email, subject, html, text });
    }
  } catch (e) {
    console.error(`JEBI order email failed for ${o.ref}`, e);
  }
}
