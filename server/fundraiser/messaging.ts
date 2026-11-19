import nodemailer from 'nodemailer';

/**
 * Outbound email + text for the fundraiser. Each channel switches on when its
 * Render settings are present — nothing else to change.
 *
 * Email (either one):
 *   RESEND_API_KEY                      Resend (needs mthc1867.org verified in Resend — DNS at Namecheap)
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 *                                       any mailbox, e.g. Zoho: smtp.zoho.com / 465 / you@mthc1867.org / app password
 *   MAIL_FROM        "Maroon Tiger Homerun Club <fundraiser@mthc1867.org>"
 *   MAIL_REPLY_TO    optional reply-to address
 *
 * MASTER SWITCH — nothing is ever sent unless FUNDRAISER_SENDING=on, even when the
 * email/text settings below are filled in. Leave it off until you're ready to go live.
 *
 * Text (automated, carrier-registered number):
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM (a +1 number) or TWILIO_MESSAGING_SERVICE_SID
 */

/** Master switch: the site sends nothing unless this is exactly "on". */
export const sendingOn = () => (process.env.FUNDRAISER_SENDING || '').trim().toLowerCase() === 'on';
export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER));
export const smsConfigured = () =>
  Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && (process.env.TWILIO_FROM || process.env.TWILIO_MESSAGING_SERVICE_SID));
export const emailEnabled = () => sendingOn() && emailConfigured();
export const smsEnabled = () => sendingOn() && smsConfigured();

const TITLES = /^(aunt|auntie|uncle|grandma|grandpa|granny|nana|papa|cousin|coach|pastor|rev|reverend|mr|mrs|ms|miss|dr|sister|brother|mama|godmother|godfather)\.?$/i;
/** "Aunt Pam Jones" -> "Aunt Pam", "Pam Jones" -> "Pam" */
export const greetName = (name: string) => {
  const w = name.trim().split(/\s+/);
  return TITLES.test(w[0]) && w[1] ? `${w[0]} ${w[1]}` : w[0];
};

const mailFrom = () => process.env.MAIL_FROM || process.env.SMTP_USER || 'Maroon Tiger Homerun Club <fundraiser@mthc1867.org>';

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

export async function sendEmail(msg: { to: string; subject: string; html: string; text: string; unsubscribeUrl?: string }) {
  if (!emailEnabled()) throw new Error('Email sending is off');
  const headers: Record<string, string> = {};
  if (msg.unsubscribeUrl) headers['List-Unsubscribe'] = `<${msg.unsubscribeUrl}>`;
  const replyTo = process.env.MAIL_REPLY_TO || undefined;

  if (process.env.RESEND_API_KEY) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: mailFrom(), to: [msg.to], subject: msg.subject, html: msg.html, text: msg.text, reply_to: replyTo, headers }),
    });
    if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 200)}`);
    return;
  }
  await smtp().sendMail({ from: mailFrom(), to: msg.to, replyTo, subject: msg.subject, html: msg.html, text: msg.text, headers });
}

export class OptedOutError extends Error {}

export async function sendSms(to: string, body: string) {
  if (!smsEnabled()) throw new Error('Text sending is off');
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const form = new URLSearchParams({ To: to, Body: body });
  if (process.env.TWILIO_MESSAGING_SERVICE_SID) form.set('MessagingServiceSid', process.env.TWILIO_MESSAGING_SERVICE_SID);
  else form.set('From', process.env.TWILIO_FROM!);
  const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form,
  });
  if (!r.ok) {
    const d = (await r.json().catch(() => ({}))) as { code?: number; message?: string };
    if (d.code === 21610) throw new OptedOutError('Recipient replied STOP');
    throw new Error(`Twilio ${r.status}: ${d.message || 'send failed'}`);
  }
}

/** "(404) 555-1234" / "404.555.1234" / "+14045551234" -> "+14045551234" (US numbers only). */
export function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return null;
}

// ── Templates ────────────────────────────────────────────────────────────────
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export type MessageKind = 'invite' | 'reminder' | 'last-chance';

export interface MessageInput {
  kind: MessageKind;
  contactName: string;
  playerName: string;
  playerNumber: string | null;
  playerPhoto: string | null;
  personalNote: string | null;
  link: string;
  unsubscribeUrl: string;
  endDate: string; // "January 27"
}

const firstName = (n: string) => n.trim().split(/\s+/)[0];

function subjectFor(m: MessageInput) {
  const p = firstName(m.playerName);
  if (m.kind === 'invite') return `${m.playerName} invited you to support Morehouse Baseball`;
  if (m.kind === 'reminder') return `A reminder from ${p} — Morehouse Baseball fundraiser`;
  return `Last chance to support ${p} — fundraiser ends ${m.endDate}`;
}

function leadFor(m: MessageInput) {
  const p = firstName(m.playerName);
  if (m.kind === 'invite')
    return `${m.playerName}${m.playerNumber ? ` (#${m.playerNumber})` : ''} plays for Morehouse College Baseball and asked us to send you a personal invitation to support the team.`;
  if (m.kind === 'reminder')
    return `Just a friendly reminder — ${p} is still working toward their fundraising goal for Morehouse Baseball, and your support would mean a lot.`;
  return `The Maroon Tiger fundraiser ends ${m.endDate}. There's still time to support ${p} and send a good-luck note.`;
}

export function emailFor(m: MessageInput) {
  const p = firstName(m.playerName);
  const subject = subjectFor(m);
  const lead = leadFor(m);
  const note = m.personalNote?.trim();
  const text = [
    `Hi ${greetName(m.contactName)},`,
    '',
    lead,
    note ? `\n"${note}" — ${p}\n` : '',
    `Give any amount and leave ${p} a good-luck note. It's delivered to them in a sealed envelope:`,
    m.link,
    '',
    'Thank you for supporting Morehouse Baseball.',
    'Maroon Tiger Homerun Club',
    '',
    `Don't want these emails? ${m.unsubscribeUrl}`,
  ].join('\n');

  const html = `<!doctype html><html><body style="margin:0;background:#faf7f2;font-family:Arial,Helvetica,sans-serif;color:#120c0d">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#7a1d2d;padding:20px 24px;text-align:center;color:#E2C67D;font-size:13px;letter-spacing:3px;font-weight:bold;text-transform:uppercase">Maroon Tiger Homerun Club</td></tr>
<tr><td style="padding:28px 28px 8px;text-align:center">
${m.playerPhoto ? `<img src="${esc(m.playerPhoto)}" width="96" height="96" alt="" style="border-radius:50%;border:4px solid #C9A54E;object-fit:cover">` : ''}
<h1 style="font-size:24px;line-height:1.2;margin:16px 0 4px;text-transform:uppercase">${m.kind === 'last-chance' ? 'Last chance' : 'You’re invited'}</h1>
<p style="margin:0;color:#6b6b6b;font-size:14px">${esc(m.playerName)}${m.playerNumber ? ` · #${esc(m.playerNumber)}` : ''} · Morehouse Baseball</p>
</td></tr>
<tr><td style="padding:16px 28px;font-size:16px;line-height:1.55">
<p style="margin:0 0 14px">Hi ${esc(greetName(m.contactName))},</p>
<p style="margin:0 0 14px">${esc(lead)}</p>
${note ? `<p style="margin:0 0 14px;padding:14px 16px;background:#faf7f2;border-left:4px solid #C9A54E;font-style:italic">“${esc(note)}” — ${esc(p)}</p>` : ''}
<p style="margin:0 0 22px">Give any amount and leave ${esc(p)} a good-luck note — it’s delivered to them in a sealed envelope.</p>
<p style="text-align:center;margin:0 0 26px"><a href="${esc(m.link)}" style="display:inline-block;background:#7a1d2d;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:999px">Open your invitation</a></p>
<p style="margin:0;color:#6b6b6b;font-size:14px">Thank you for supporting Morehouse Baseball.<br>Maroon Tiger Homerun Club</p>
</td></tr>
<tr><td style="padding:16px 28px 24px;font-size:12px;color:#9b9b9b;text-align:center">Sent on behalf of ${esc(m.playerName)}. <a href="${esc(m.unsubscribeUrl)}" style="color:#9b9b9b">Stop these emails</a></td></tr>
</table></td></tr></table></body></html>`;
  return { subject, html, text };
}

/** Text body. Automated texts must identify the sender and offer STOP. */
export function smsFor(m: MessageInput, automated: boolean) {
  const p = firstName(m.playerName);
  const body =
    m.kind === 'invite'
      ? `Hi ${greetName(m.contactName)}! ${automated ? `${m.playerName} of Morehouse Baseball invited you` : `It's ${p}. I'm raising money for Morehouse Baseball`} — give any amount & send ${automated ? p : 'me'} a good-luck note: ${m.link}`
      : m.kind === 'reminder'
        ? `Hi ${greetName(m.contactName)}, friendly reminder${automated ? ` from ${p}'s Morehouse Baseball fundraiser` : ` — it's ${p}`}! Any amount helps: ${m.link}`
        : `Last chance! ${automated ? `${p}'s` : 'My'} Morehouse Baseball fundraiser ends ${m.endDate}: ${m.link}`;
  return automated ? `MTHC: ${body} Reply STOP to opt out.` : body;
}
