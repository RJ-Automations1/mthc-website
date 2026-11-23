import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { RefreshCw } from 'lucide-react';
import { HeaderBacker, api, money, useTitle } from './shared';

interface AdminPlayer {
  slug: string;
  name: string;
  email: string | null;
  number: string | null;
  goal: number;
  raised: number;
  gifts: number;
  pending: number;
  shareUrl: string;
  inboxUrl: string;
  hasPin: boolean;
  outreach: { contacts: number; invited: number; visited: number; donated: number; opted_out: number };
}
interface AdminGift {
  ref: string;
  amount: number;
  donor_name: string;
  donor_email: string;
  note: string | null;
  anonymous: boolean;
  status: 'pending' | 'paid' | 'cancelled';
  opened_at: string | null;
  created_at: string;
  player_name: string;
}
interface Report {
  squareConnected: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  sendingOn: boolean;
  emailConfigured: boolean;
  smsConfigured: boolean;
  endDate: string;
  players: AdminPlayer[];
  gifts: AdminGift[];
}

const STORE = 'mthc-fundraiser-admin';

/** Board view: every player's links and totals, every gift, and manual payment matching. */
export default function FundraiserAdmin() {
  useTitle('Fundraiser admin');
  const [key, setKey] = useState(() => {
    try {
      return sessionStorage.getItem(STORE) || '';
    } catch {
      return '';
    }
  });
  const [entry, setEntry] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [newName, setNewName] = useState('');
  const [newGoal, setNewGoal] = useState('500');

  const call = useCallback(
    <T,>(path: string, init?: RequestInit & { json?: unknown }) =>
      api<T>(`/api/fundraiser/admin${path}`, { ...init, headers: { 'x-admin-key': key, ...(init?.headers || {}) } }),
    [key],
  );

  const load = useCallback(() => {
    if (!key) return;
    call<Report>('')
      .then((r) => {
        setReport(r);
        setError('');
        try {
          sessionStorage.setItem(STORE, key);
        } catch {
          /* ignore */
        }
      })
      .catch((e) => setError(e.message));
  }, [key, call]);

  useEffect(load, [load]);

  async function addPlayer(e: FormEvent) {
    e.preventDefault();
    try {
      await call('/players', { method: 'POST', json: { name: newName, goal: Number(newGoal) } });
      setNewName('');
      load();
    } catch (err: any) {
      setMsg(err.message);
    }
  }
  async function setStatus(ref: string, status: string) {
    await call(`/gifts/${ref}/status`, { method: 'POST', json: { status } }).catch((e) => setMsg(e.message));
    load();
  }
  async function sync() {
    try {
      const r = await call<{ checked: number; marked: number }>('/sync', { method: 'POST' });
      setMsg(`Checked ${r.checked} pending gift(s) with Square — ${r.marked} newly paid.`);
      load();
    } catch (e: any) {
      setMsg(e.message);
    }
  }
  async function resetKey(slug: string) {
    if (!confirm('Make a new private mailbox link? The old one will stop working.')) return;
    await call(`/players/${slug}/reset-key`, { method: 'POST' }).catch((e) => setMsg(e.message));
    load();
  }
  async function remove(p: AdminPlayer) {
    if (!confirm(`Delete ${p.name}'s page and all of their gifts records? This can't be undone.`)) return;
    await call(`/players/${p.slug}`, { method: 'DELETE' }).catch((e) => setMsg(e.message));
    load();
  }
  async function resetPin(p: AdminPlayer) {
    if (!confirm(`Reset ${p.name}'s PIN? They'll create a new one the next time they sign in.`)) return;
    await call(`/players/${p.slug}/reset-pin`, { method: 'POST' }).catch((e) => setMsg(e.message));
    setMsg(`${p.name} can now set a new PIN.`);
    load();
  }
  async function runFollowUps() {
    try {
      const r = await call<{ sent: number }>('/followups/run', { method: 'POST' });
      setMsg(`Sent ${r.sent} follow-up${r.sent === 1 ? '' : 's'} that were due.`);
      load();
    } catch (e: any) {
      setMsg(e.message);
    }
  }
  async function contactsCsv() {
    try {
      const { contacts } = await call<{ contacts: Record<string, any>[] }>('/contacts');
      const cols = ['player', 'name', 'email', 'phone', 'emailed_at', 'texted_at', 'sms_sent_at', 'visited_at', 'donated_at', 'followups', 'unsubscribed_at', 'send_error', 'created_at'];
      const text = [cols.join(',')]
        .concat(contacts.map((c) => cols.map((k) => `"${String(c[k] ?? '').replace(/"/g, '""')}"`).join(',')))
        .join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
      a.download = 'mthc-fundraiser-contacts.csv';
      a.click();
    } catch (e: any) {
      setMsg(e.message);
    }
  }
  const copy = (t: string) => navigator.clipboard?.writeText(t).then(() => setMsg('Copied.'));

  if (!report) {
    return (
      <>
        <HeaderBacker />
        <section className="pt-36 pb-24 px-4">
          <form
            className="max-w-sm mx-auto card hover:translate-y-0 p-6 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              setKey(entry);
            }}
          >
            <h1 className="font-display uppercase text-3xl font-bold text-ink">Fundraiser admin</h1>
            <input type="password" value={entry} onChange={(e) => setEntry(e.target.value)} className="input" placeholder="Admin key" aria-label="Admin key" />
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button className="btn-primary w-full">Open</button>
          </form>
        </section>
      </>
    );
  }

  const totalRaised = report.players.reduce((s, p) => s + p.raised, 0);
  const csv = () => {
    const rows = [['ref', 'player', 'amount', 'status', 'donor', 'email', 'anonymous', 'note', 'date']].concat(
      report.gifts.map((g) => [g.ref, g.player_name, String(g.amount), g.status, g.donor_name, g.donor_email, g.anonymous ? 'yes' : '', g.note || '', g.created_at]),
    );
    const text = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
    a.download = 'mthc-fundraiser-gifts.csv';
    a.click();
  };

  return (
    <>
      <HeaderBacker />
      <section className="pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display uppercase text-4xl font-bold text-ink">Player fundraiser</h1>
              <p className="text-gray-600">
                {money(totalRaised)} raised · {report.players.length} players ·{' '}
                Square {report.squareConnected ? 'connected (gifts confirm automatically)' : 'NOT connected — mark gifts paid by hand'}
              </p>
              <p className="text-gray-600 text-sm">
                <strong className={report.sendingOn ? 'text-green-700' : 'text-red-700'}>Sending {report.sendingOn ? 'ON' : 'OFF — nothing is emailed or texted'}</strong> ·{' '}
                Email {report.emailConfigured ? 'connected' : 'not connected'} · Auto-texts {report.smsConfigured ? 'connected' : 'not connected'} · Ends {report.endDate} ·{' '}
                Player portal link: <button className="text-maroon hover:underline" onClick={() => copy(`${window.location.origin}/fundraiser/players`)}>copy</button>
              </p>
            </div>
            <div className="flex gap-2">
              {report.squareConnected && (
                <button onClick={sync} className="btn-secondary !py-2 text-sm"><RefreshCw className="w-4 h-4" /> Check Square</button>
              )}
              {(report.emailEnabled || report.smsEnabled) && (
                <button onClick={runFollowUps} className="btn-secondary !py-2 text-sm">Send due follow-ups</button>
              )}
              <button onClick={csv} className="btn-secondary !py-2 text-sm">Gifts CSV</button>
              <button onClick={contactsCsv} className="btn-secondary !py-2 text-sm">Contacts CSV</button>
            </div>
          </div>
          {msg && <p className="p-3 rounded-lg bg-gold/20 text-sm">{msg}</p>}

          <form onSubmit={addPlayer} className="card hover:translate-y-0 p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="np">Add a player</label>
              <input id="np" required value={newName} onChange={(e) => setNewName(e.target.value)} className="input" placeholder="Player name" />
            </div>
            <div className="w-28">
              <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="ng">Goal $</label>
              <input id="ng" value={newGoal} onChange={(e) => setNewGoal(e.target.value.replace(/[^\d]/g, ''))} className="input" />
            </div>
            <button className="btn-primary">Add</button>
          </form>

          <div className="card hover:translate-y-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr><th className="p-3">Player</th><th className="p-3">Raised</th><th className="p-3">Gifts</th><th className="p-3">Outreach</th><th className="p-3">Links</th><th className="p-3"></th></tr>
              </thead>
              <tbody>
                {report.players.map((p) => (
                  <tr key={p.slug} className="border-t">
                    <td className="p-3 font-semibold">{p.number && <span className="text-maroon">#{p.number} </span>}{p.name}</td>
                    <td className="p-3">{money(p.raised)} / {money(p.goal)}</td>
                    <td className="p-3">{p.gifts}{p.pending ? <span className="text-amber-600"> (+{p.pending} pending)</span> : null}</td>
                    <td className="p-3 text-xs whitespace-nowrap">
                      {p.outreach.contacts ? (
                        <>
                          {p.outreach.contacts} listed · {p.outreach.invited} invited<br />
                          {p.outreach.visited} opened · <span className="text-green-700 font-semibold">{p.outreach.donated} gave</span>
                          {p.outreach.opted_out ? ` · ${p.outreach.opted_out} opted out` : ''}
                        </>
                      ) : (
                        <span className="text-gray-400">{p.hasPin ? 'Signed in, no list yet' : 'Not signed in yet'}</span>
                      )}
                    </td>
                    <td className="p-3 space-x-2 whitespace-nowrap">
                      <button className="text-maroon hover:underline" onClick={() => copy(p.shareUrl)}>Copy invite link</button>
                      <button className="text-maroon hover:underline" onClick={() => copy(p.inboxUrl)}>Copy private mailbox</button>
                    </td>
                    <td className="p-3 space-x-2 whitespace-nowrap text-xs">
                      {p.hasPin && <button className="text-gray-500 hover:underline" onClick={() => resetPin(p)}>Reset PIN</button>}
                      <button className="text-gray-500 hover:underline" onClick={() => resetKey(p.slug)}>New mailbox link</button>
                      <button className="text-red-600 hover:underline" onClick={() => remove(p)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card hover:translate-y-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr><th className="p-3">Ref</th><th className="p-3">For</th><th className="p-3">From</th><th className="p-3">Amount</th><th className="p-3">Note</th><th className="p-3">Status</th></tr>
              </thead>
              <tbody>
                {report.gifts.map((g) => (
                  <tr key={g.ref} className="border-t align-top">
                    <td className="p-3 font-mono text-xs">{g.ref}<br /><span className="text-gray-400">{new Date(g.created_at).toLocaleDateString()}</span></td>
                    <td className="p-3">{g.player_name}</td>
                    <td className="p-3">{g.donor_name}{g.anonymous && ' (secret)'}<br /><span className="text-xs text-gray-500">{g.donor_email}</span></td>
                    <td className="p-3">{money(g.amount)}</td>
                    <td className="p-3 max-w-xs text-gray-600">{g.note}</td>
                    <td className="p-3">
                      <select value={g.status} onChange={(e) => setStatus(g.ref, e.target.value)} className="rounded-lg border-gray-200 text-sm" aria-label={`Status of ${g.ref}`}>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid (delivered)</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {g.opened_at && <div className="text-xs text-green-700 mt-1">Opened</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
