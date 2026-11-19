import { useState, type FormEvent } from 'react';
import { BadgeCheck, Eye, Mail, MessageSquare, Plus, Send, Trash2, UserX } from 'lucide-react';
import { api } from './shared';

export interface ContactRow {
  ref: string;
  name: string;
  email: string | null;
  phone: string | null;
  link: string;
  emailed: boolean;
  texted: boolean;
  invitedAt: string | null;
  visited: boolean;
  donated: boolean;
  followups: number;
  optedOut: boolean;
  error: string | null;
  textReminderDue: boolean;
}

interface Props {
  slug: string;
  portalKey: string;
  playerName: string;
  blurb: string | null;
  email: string | null;
  contacts: ContactRow[];
  emailEnabled: boolean;
  smsEnabled: boolean;
  endDate: string;
  over: boolean;
  onChange: () => void;
}

const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
const TITLES = /^(aunt|auntie|uncle|grandma|grandpa|granny|nana|papa|cousin|coach|pastor|rev|reverend|mr|mrs|ms|miss|dr|sister|brother|mama|godmother|godfather)\.?$/i;
const greetName = (name: string) => {
  const w = name.trim().split(/\s+/);
  return TITLES.test(w[0]) && w[1] ? `${w[0]} ${w[1]}` : w[0];
};
const prettyPhone = (p: string) => p.replace(/^\+1(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3');

/** "Aunt Pam, pam@x.com, 404-555-1234" / tab-separated / one per line */
function parseList(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[,\t;]+/).map((s) => s.trim()).filter(Boolean);
      const email = parts.find((s) => s.includes('@')) || '';
      const phone = parts.find((s) => !s.includes('@') && s.replace(/\D/g, '').length >= 10) || '';
      const name = parts.filter((s) => s !== email && s !== phone).join(' ') || email.split('@')[0] || phone;
      return { name, email, phone };
    });
}

function Status({ c }: { c: ContactRow }) {
  if (c.donated) return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs font-semibold"><BadgeCheck className="w-3.5 h-3.5" /> Donated</span>;
  if (c.optedOut) return <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-500 px-2 py-0.5 text-xs"><UserX className="w-3.5 h-3.5" /> Opted out</span>;
  if (c.visited) return <span className="inline-flex items-center gap-1 rounded-full bg-gold/25 text-gold-dark px-2 py-0.5 text-xs font-semibold"><Eye className="w-3.5 h-3.5" /> Opened it</span>;
  if (c.emailed || c.texted) return <span className="rounded-full bg-maroon/10 text-maroon px-2 py-0.5 text-xs font-semibold">Invited{c.followups ? ` · ${c.followups} follow-up${c.followups > 1 ? 's' : ''}` : ''}</span>;
  return <span className="rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-xs">Not invited yet</span>;
}

export default function SupportersPanel(props: Props) {
  const { slug, portalKey, playerName, contacts } = props;
  const first = playerName.split(/\s+/)[0];
  const headers = { 'x-portal-key': portalKey };
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bulk, setBulk] = useState('');
  const [showBulk, setShowBulk] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [blurb, setBlurb] = useState(props.blurb || '');
  const [myEmail, setMyEmail] = useState(props.email || '');
  const [saved, setSaved] = useState('');

  const invited = contacts.filter((c) => c.emailed || c.texted).length;
  const visited = contacts.filter((c) => c.visited).length;
  const donated = contacts.filter((c) => c.donated).length;
  const notYet = contacts.filter((c) => !c.donated && !c.optedOut).length;
  const toEmail = contacts.filter((c) => c.email && !c.emailed && !c.donated && !c.optedOut).length;
  const toAutoText = props.smsEnabled ? contacts.filter((c) => c.phone && !c.texted && !c.donated && !c.optedOut).length : 0;
  const readyToSend = (props.emailEnabled ? toEmail : 0) + toAutoText;

  async function add(list: { name: string; email?: string; phone?: string }[]) {
    setErr('');
    setMsg('');
    setBusy(true);
    try {
      const r = await api<{ added: string[]; skipped: string[] }>(`/api/fundraiser/inbox/${slug}/contacts`, { method: 'POST', headers, json: { contacts: list } });
      setMsg(`Added ${r.added.length}.${r.skipped.length ? ` Skipped: ${r.skipped.join('; ')}` : ''}`);
      props.onChange();
      return r.added.length > 0;
    } catch (e: any) {
      setErr(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function addOne(e: FormEvent) {
    e.preventDefault();
    if (!email && !phone) return setErr('Add an email or a phone number (or both).');
    if (await add([{ name, email, phone }])) {
      setName('');
      setEmail('');
      setPhone('');
    }
  }

  async function addBulk() {
    const list = parseList(bulk);
    if (!list.length) return setErr('Paste one person per line: name, email and/or phone.');
    if (await add(list)) {
      setBulk('');
      setShowBulk(false);
    }
  }

  async function sendAll() {
    setErr('');
    setMsg('');
    setBusy(true);
    try {
      const r = await api<{ sent: number; waiting: number; message?: string }>(`/api/fundraiser/inbox/${slug}/send-invites`, { method: 'POST', headers });
      setMsg(r.message || `Sent ${r.sent} invitation${r.sent === 1 ? '' : 's'}. We’ll follow up with anyone who hasn’t given yet.`);
      props.onChange();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  function textLink(c: ContactRow) {
    const cf = greetName(c.name);
    const body = c.texted
      ? `Hi ${cf}, friendly reminder — it's ${first}! I'm still raising money for Morehouse Baseball. Any amount helps: ${c.link}`
      : `Hi ${cf}! It's ${first}. I'm raising money for Morehouse Baseball — would you support me? Give any amount and send me a good-luck note here: ${c.link}`;
    return `sms:${c.phone}${isIOS ? '&' : '?'}body=${encodeURIComponent(body)}`;
  }

  function markTexted(c: ContactRow) {
    api(`/api/fundraiser/inbox/${slug}/contacts/${c.ref}/texted`, { method: 'POST', headers }).then(props.onChange).catch(() => undefined);
  }

  async function remove(c: ContactRow) {
    if (!confirm(`Remove ${c.name} from your list?`)) return;
    await api(`/api/fundraiser/inbox/${slug}/contacts/${c.ref}`, { method: 'DELETE', headers }).catch(() => undefined);
    props.onChange();
  }

  async function saveSettings(e: FormEvent) {
    e.preventDefault();
    setSaved('');
    try {
      await api(`/api/fundraiser/inbox/${slug}`, { method: 'PATCH', headers, json: { blurb, email: myEmail } });
      setSaved('Saved.');
      props.onChange();
    } catch (e: any) {
      setSaved(e.message);
    }
  }

  // Not-yet-donated first, donated last
  const sorted = [...contacts].sort((a, b) => Number(a.donated) - Number(b.donated) || Number(a.optedOut) - Number(b.optedOut));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-heading !text-3xl !mb-1">My supporters</h2>
        <p className="text-gray-600">
          Add the people you want invited. We send each one your personal invitation, follow up with anyone who hasn’t given,
          and stop once they do. The fundraiser ends {props.endDate}.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['On your list', contacts.length],
          ['Invited', invited],
          ['Opened', visited],
          ['Donated', donated],
        ].map(([label, n]) => (
          <div key={label} className="card hover:translate-y-0 p-4 text-center">
            <div className="font-display text-3xl font-bold text-ink">{n}</div>
            <div className="text-xs uppercase tracking-wider text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="card hover:translate-y-0 p-5 space-y-4">
        <form onSubmit={addOne} className="grid sm:grid-cols-[1.2fr_1.4fr_1fr_auto] gap-2 items-end">
          <div>
            <label htmlFor="cn" className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input id="cn" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Aunt Pam" />
          </div>
          <div>
            <label htmlFor="ce" className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input id="ce" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="pam@email.com" />
          </div>
          <div>
            <label htmlFor="cp" className="block text-xs font-medium text-gray-600 mb-1">Cell phone</label>
            <input id="cp" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="404-555-1234" />
          </div>
          <button disabled={busy} className="btn-primary !px-4 disabled:opacity-60"><Plus className="w-4 h-4" /> Add</button>
        </form>
        <button type="button" onClick={() => setShowBulk((v) => !v)} className="text-sm text-maroon hover:underline">
          {showBulk ? 'Hide' : 'Paste a whole list instead'}
        </button>
        {showBulk && (
          <div className="space-y-2">
            <textarea rows={6} value={bulk} onChange={(e) => setBulk(e.target.value)} className="input font-mono text-sm" placeholder={'One person per line:\nAunt Pam, pam@email.com, 404-555-1234\nCoach Lee, 770-555-9876\nGrandma Ruth, ruth@email.com'} />
            <button type="button" onClick={addBulk} disabled={busy} className="btn-secondary !py-2 text-sm">Add everyone</button>
          </div>
        )}
        {err && <p className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{err}</p>}
        {msg && <p className="p-3 rounded-lg bg-gold/20 text-sm">{msg}</p>}

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
          <button type="button" onClick={sendAll} disabled={busy || readyToSend === 0 || props.over} className="btn-primary uppercase tracking-wider text-sm disabled:opacity-50">
            <Send className="w-4 h-4" /> Send {readyToSend || ''} invitation{readyToSend === 1 ? '' : 's'}
          </button>
          <p className="text-xs text-gray-500 flex-1 min-w-[200px]">
            {props.emailEnabled
              ? props.smsEnabled
                ? 'We email and text everyone you haven’t invited yet.'
                : 'We email everyone with an email address. For phone numbers, tap “Text” to send from your phone.'
              : 'Invitations from MTHC aren’t switched on yet — your list is saved and goes out once they are. You can also tap “Text” to send from your own phone.'}
          </p>
        </div>
      </div>

      {contacts.length > 0 && (
        <div className="card hover:translate-y-0 divide-y">
          {notYet > 0 && <p className="px-4 py-2 text-xs text-gray-500 bg-gray-50">{notYet} still to give · tap Text to send a personal text from your phone</p>}
          {sorted.map((c) => (
            <div key={c.ref} className={`p-4 flex flex-wrap items-center gap-3 ${c.textReminderDue ? 'bg-gold/10' : ''}`}>
              <div className="flex-1 min-w-[180px]">
                <p className="font-semibold text-ink">{c.name}</p>
                <p className="text-xs text-gray-500 break-all">
                  {[c.email, c.phone && prettyPhone(c.phone)].filter(Boolean).join(' · ')}
                </p>
                {c.textReminderDue && <p className="text-xs text-gold-dark font-semibold mt-1">Time for a reminder text</p>}
                {c.error && !c.donated && <p className="text-xs text-red-600 mt-1">Couldn’t send — check this address</p>}
              </div>
              <Status c={c} />
              <div className="flex items-center gap-1">
                {c.phone && !c.donated && !c.optedOut && (
                  <a href={textLink(c)} onClick={() => markTexted(c)} className="btn-secondary !px-3 !py-1.5 text-xs">
                    <MessageSquare className="w-3.5 h-3.5" /> {c.texted ? 'Remind' : 'Text'}
                  </a>
                )}
                {c.email && !c.emailed && !c.donated && !props.emailEnabled && (
                  <a href={`mailto:${c.email}?subject=${encodeURIComponent(`Support me and Morehouse Baseball`)}&body=${encodeURIComponent(`Hi ${greetName(c.name)}! It's ${first}. I'm raising money for Morehouse Baseball — would you support me? Give any amount and send me a good-luck note here: ${c.link}`)}`} className="btn-secondary !px-3 !py-1.5 text-xs">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </a>
                )}
                {!c.donated && (
                  <button type="button" onClick={() => remove(c)} className="p-2 text-gray-400 hover:text-red-600" aria-label={`Remove ${c.name}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={saveSettings} className="card hover:translate-y-0 p-5 space-y-3">
        <h3 className="font-display uppercase text-xl font-bold text-ink">Your invitation message</h3>
        <textarea rows={3} maxLength={400} value={blurb} onChange={(e) => setBlurb(e.target.value)} className="input resize-none" placeholder="Help me and my teammates have our best season yet! Every dollar goes to Morehouse Baseball." />
        <div>
          <label htmlFor="me" className="block text-xs font-medium text-gray-600 mb-1">Your email — we’ll tell you when a new envelope arrives (optional)</label>
          <input id="me" type="email" value={myEmail} onChange={(e) => setMyEmail(e.target.value)} className="input" />
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary !py-2 text-sm">Save</button>
          {saved && <span className="text-sm text-gray-600">{saved}</span>}
        </div>
      </form>
    </div>
  );
}
