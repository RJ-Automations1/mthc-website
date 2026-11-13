import { useEffect, useState, type FormEvent } from 'react';
import { Lock, RefreshCw } from 'lucide-react';
import usePageTitle from './usePageTitle';

/**
 * Private stock + orders view for MTHC staff (not linked from the site).
 * Requires the JEBI_ADMIN_KEY set on the Render service.
 */
interface InvItem {
  id: string;
  name: string;
  details: string;
  qty: number;
  cost: number;
  price: number;
  options?: { label: string; cost: number; price: number }[];
  sold: number;
  claimed: number;
  remaining: number;
  stockCost: number;
}
interface InvTier {
  tier: number;
  name: string;
  markup: number;
  items: InvItem[];
  subtotalCost: number;
}
interface Order {
  ref: string;
  item_id: string;
  option_id: string | null;
  qty: number;
  total: number;
  kind: 'purchase' | 'claim';
  tier_code: number | null;
  name: string;
  email: string;
  phone: string | null;
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled';
  created_at: string;
}
interface AccessCode {
  code: string;
  tier: number;
  label: string | null;
  created_at: string | null;
  used_ref: string | null;
  used_by: string | null;
  used_item: string | null;
}
interface Inventory {
  tiers: InvTier[];
  totalCost: number;
  ordersEnabled: boolean;
  squareConnected: boolean;
  orders: Order[];
  codes: AccessCode[];
}

const money = (n: number) => `$${n.toLocaleString('en-US')}`;
const KEY = 'jebi-admin-key';
const STATUS_STYLE: Record<Order['status'], string> = {
  pending: 'bg-amber-100 text-amber-800',
  paid: 'bg-green-100 text-green-800',
  fulfilled: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-gray-200 text-gray-500 line-through',
};

export default function JebiShopInventory() {
  usePageTitle('Inventory');
  const [key, setKey] = useState(() => {
    try {
      return sessionStorage.getItem(KEY) || '';
    } catch {
      return '';
    }
  });
  const [data, setData] = useState<Inventory | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const m = document.createElement('meta');
    m.name = 'robots';
    m.content = 'noindex,nofollow';
    document.head.appendChild(m);
    return () => m.remove();
  }, []);

  const load = async (k = key) => {
    setError('');
    const r = await fetch('/api/jebi/shop/inventory', { headers: { 'x-admin-key': k } }).catch(() => null);
    if (!r) return setError('Could not reach the server.');
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      setData(null);
      return setError(d.message || 'Not allowed.');
    }
    setData(d);
    try {
      sessionStorage.setItem(KEY, k);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (key) load(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStatus = async (ref: string, status: Order['status']) => {
    if (status === 'cancelled' && !window.confirm(`Cancel order ${ref}? Its items go back into stock.`)) return;
    await fetch(`/api/jebi/shop/orders/${ref}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const [syncMsg, setSyncMsg] = useState('');
  const syncSquare = async () => {
    setSyncMsg('Checking Square…');
    const r = await fetch('/api/jebi/shop/orders/sync', { method: 'POST', headers: { 'x-admin-key': key } }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    setSyncMsg(r?.ok ? `Checked ${d.checked} unpaid order(s) — ${d.marked} now marked paid.` : d.message || 'Could not reach Square.');
    load();
  };

  const [newCode, setNewCode] = useState({ label: '', tier: '1' });
  const [created, setCreated] = useState<{ code: string; tier: number; label: string } | null>(null);
  const [codeErr, setCodeErr] = useState('');
  const createCode = async (e: FormEvent) => {
    e.preventDefault();
    setCodeErr('');
    const r = await fetch('/api/jebi/shop/codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
      body: JSON.stringify({ tier: Number(newCode.tier), label: newCode.label }),
    }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    if (!r || !r.ok) return setCodeErr(d.message || 'Could not create the code.');
    setCreated(d);
    setNewCode({ label: '', tier: newCode.tier });
    load();
  };

  const itemName = (id: string) => data?.tiers.flatMap((t) => t.items).find((i) => i.id === id)?.name ?? id;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
      <div className="fixed inset-x-0 top-0 h-20 bg-ink z-40" aria-hidden="true" />
      <span className="eyebrow">Staff only</span>
      <h1 className="mt-3 font-display uppercase text-5xl font-bold text-ink leading-none">JEBI shop inventory</h1>
      <p className="mt-3 text-gray-600">Stock, sales, sponsor claims and orders. This page is private and not linked from the site.</p>

      {!data && (
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            load();
          }}
          className="mt-8 card p-6 hover:translate-y-0 max-w-md"
        >
          <label htmlFor="admin-key" className="text-sm font-semibold text-gray-700">
            Admin key
          </label>
          <div className="mt-2 flex gap-3">
            <input id="admin-key" type="password" value={key} onChange={(e) => setKey(e.target.value)} className="input" autoComplete="off" />
            <button type="submit" className="btn-primary text-sm">
              <Lock className="w-4 h-4" /> Open
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </form>
      )}

      {data && (
        <div className="mt-8 space-y-8">
          <div className="flex flex-wrap items-center gap-6 rounded-2xl bg-jebi text-white px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gold font-bold">Merchandise subtotal (cost)</p>
              <p className="font-display text-4xl font-bold">{money(data.totalCost)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gold font-bold">Orders</p>
              <p className="font-display text-4xl font-bold">{data.orders.filter((o) => o.status !== 'cancelled').length}</p>
            </div>
            {!data.ordersEnabled && (
              <p className="text-sm bg-black/25 rounded-xl px-3 py-2">Ordering is off — the database isn't connected (DATABASE_URL).</p>
            )}
            <p className="text-sm bg-black/25 rounded-xl px-3 py-2">
              {data.squareConnected
                ? 'Square connected — buyers get exact-amount checkout and payments are confirmed automatically.'
                : 'Square not connected — buyers use the static donation link; mark payments by hand.'}
            </p>
            {data.squareConnected && (
              <button type="button" onClick={syncSquare} className="btn-gold text-sm">
                Check Square payments
              </button>
            )}
            {syncMsg && <p className="text-sm text-gold">{syncMsg}</p>}
            <button type="button" onClick={() => load()} className="ml-auto btn-ghost-light text-sm">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>

          {data.tiers.map((t) => (
            <div key={t.tier} className="card hover:translate-y-0">
              <div className="px-6 py-4 bg-ink text-white flex justify-between items-center">
                <h2 className="font-display uppercase text-2xl font-bold">
                  Tier {t.tier} · {t.name}
                </h2>
                <span className="text-sm text-gold font-semibold">+{money(t.markup)} markup</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="text-left px-6 py-3">Item</th>
                      <th className="text-right px-3 py-3">Start qty</th>
                      <th className="text-right px-3 py-3">Sold</th>
                      <th className="text-right px-3 py-3">Claimed</th>
                      <th className="text-right px-3 py-3">Left</th>
                      <th className="text-right px-3 py-3">Cost</th>
                      <th className="text-right px-3 py-3">Price</th>
                      <th className="text-right px-6 py-3">Stock cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {t.items.map((i) => (
                      <tr key={i.id}>
                        <td className="px-6 py-3">
                          <span className="font-semibold text-ink">{i.name}</span>
                          {i.options && <span className="block text-xs text-gray-500">{i.options.map((o) => `${o.label} ${money(o.cost)}→${money(o.price)}`).join(' · ')}</span>}
                        </td>
                        <td className="px-3 py-3 text-right">{i.qty}</td>
                        <td className="px-3 py-3 text-right">{i.sold}</td>
                        <td className="px-3 py-3 text-right">{i.claimed}</td>
                        <td className={`px-3 py-3 text-right font-bold ${i.remaining === 0 ? 'text-red-600' : i.remaining <= 2 ? 'text-amber-600' : 'text-ink'}`}>
                          {i.remaining === 0 ? 'SOLD OUT' : i.remaining}
                        </td>
                        <td className="px-3 py-3 text-right">{money(i.cost)}</td>
                        <td className="px-3 py-3 text-right text-jebi font-semibold">{money(i.price)}</td>
                        <td className="px-6 py-3 text-right">{money(i.stockCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-cream font-bold">
                      <td className="px-6 py-3" colSpan={7}>
                        Tier {t.tier} subtotal
                      </td>
                      <td className="px-6 py-3 text-right">{money(t.subtotalCost)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}

          {/* Access codes */}
          <div className="card hover:translate-y-0">
            <div className="px-6 py-4 bg-ink text-white">
              <h2 className="font-display uppercase text-2xl font-bold">Sponsor access codes</h2>
              <p className="text-sm text-white/60">Each code is good for one free item from its tier (or a lower tier).</p>
            </div>
            <form onSubmit={createCode} className="px-6 py-5 flex flex-wrap items-end gap-3 border-b border-gray-100">
              <label className="text-sm font-semibold text-gray-700 flex-1 min-w-[220px]">
                Sponsor name
                <input
                  className="input mt-1"
                  value={newCode.label}
                  onChange={(e) => setNewCode({ ...newCode, label: e.target.value })}
                  placeholder="e.g. Smith Family — Affiliate sponsor"
                />
              </label>
              <label className="text-sm font-semibold text-gray-700">
                Tier
                <select className="input mt-1 !w-36" value={newCode.tier} onChange={(e) => setNewCode({ ...newCode, tier: e.target.value })}>
                  <option value="1">Tier 1</option>
                  <option value="2">Tier 2</option>
                  <option value="3">Tier 3</option>
                </select>
              </label>
              <button type="submit" className="btn-primary text-sm">
                Create code
              </button>
              {codeErr && <p className="w-full text-sm text-red-600">{codeErr}</p>}
              {created && (
                <p className="w-full rounded-xl bg-gold/15 px-4 py-3 text-sm">
                  New Tier {created.tier} code{created.label ? ` for ${created.label}` : ''}:{' '}
                  <strong className="font-mono text-base tracking-wider">{created.code}</strong>
                  <span className="block text-xs text-gray-600 mt-1">
                    Shareable link: {window.location.origin}/shop?code={created.code}
                  </span>
                </p>
              )}
            </form>
            {data.codes.length === 0 ? (
              <p className="px-6 py-6 text-gray-500">No codes yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="text-left px-6 py-3">Code</th>
                      <th className="text-left px-3 py-3">Tier</th>
                      <th className="text-left px-3 py-3">Sponsor</th>
                      <th className="text-left px-6 py-3">Free item</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.codes.map((c) => (
                      <tr key={c.code}>
                        <td className="px-6 py-3 font-mono font-semibold tracking-wider">{c.code}</td>
                        <td className="px-3 py-3">Tier {c.tier}</td>
                        <td className="px-3 py-3">{c.label || '—'}</td>
                        <td className="px-6 py-3">
                          {c.used_ref ? (
                            <span className="text-gray-700">
                              <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold uppercase text-green-800 mr-2">Claimed</span>
                              {itemName(c.used_item || '')} · {c.used_by} · {c.used_ref}
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold uppercase text-amber-800">Not used yet</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card hover:translate-y-0">
            <div className="px-6 py-4 bg-ink text-white">
              <h2 className="font-display uppercase text-2xl font-bold">Orders & claims</h2>
            </div>
            {data.orders.length === 0 ? (
              <p className="px-6 py-6 text-gray-500">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="text-left px-6 py-3">Order</th>
                      <th className="text-left px-3 py-3">Item</th>
                      <th className="text-right px-3 py-3">Qty</th>
                      <th className="text-right px-3 py-3">Total</th>
                      <th className="text-left px-3 py-3">Type</th>
                      <th className="text-left px-3 py-3">Customer</th>
                      <th className="text-left px-3 py-3">Status</th>
                      <th className="text-right px-6 py-3">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.orders.map((o) => (
                      <tr key={o.ref}>
                        <td className="px-6 py-3">
                          <span className="font-mono font-semibold">{o.ref}</span>
                          <span className="block text-xs text-gray-500">{new Date(o.created_at).toLocaleString()}</span>
                        </td>
                        <td className="px-3 py-3">
                          {itemName(o.item_id)}
                          {o.option_id && <span className="block text-xs text-gray-500">{o.option_id.replace('-', ' ')}</span>}
                        </td>
                        <td className="px-3 py-3 text-right">{o.qty}</td>
                        <td className="px-3 py-3 text-right">{o.kind === 'claim' ? '—' : money(o.total)}</td>
                        <td className="px-3 py-3">{o.kind === 'claim' ? `Claim (Tier ${o.tier_code} code)` : 'Purchase'}</td>
                        <td className="px-3 py-3">
                          {o.name}
                          <span className="block text-xs text-gray-500">
                            {o.email}
                            {o.phone ? ` · ${o.phone}` : ''}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${STATUS_STYLE[o.status]}`}>{o.status}</span>
                        </td>
                        <td className="px-6 py-3 text-right whitespace-nowrap space-x-2">
                          {o.status !== 'paid' && o.kind === 'purchase' && o.status !== 'cancelled' && (
                            <button type="button" onClick={() => setStatus(o.ref, 'paid')} className="text-xs font-bold text-green-700 hover:underline">
                              Mark paid
                            </button>
                          )}
                          {o.status !== 'fulfilled' && o.status !== 'cancelled' && (
                            <button type="button" onClick={() => setStatus(o.ref, 'fulfilled')} className="text-xs font-bold text-blue-700 hover:underline">
                              Fulfilled
                            </button>
                          )}
                          {o.status !== 'cancelled' ? (
                            <button type="button" onClick={() => setStatus(o.ref, 'cancelled')} className="text-xs font-bold text-red-600 hover:underline">
                              Cancel
                            </button>
                          ) : (
                            <button type="button" onClick={() => setStatus(o.ref, 'pending')} className="text-xs font-bold text-gray-600 hover:underline">
                              Restore
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
