import { useEffect, useState, type FormEvent } from 'react';
import { Lock, RefreshCw } from 'lucide-react';
import usePageTitle from './usePageTitle';

/**
 * Private stock view for MTHC staff (not linked from the site).
 * Requires the JEBI_ADMIN_KEY set on the Render service.
 */
interface InvItem {
  id: string;
  name: string;
  details: string;
  qty: number;
  cost: number;
  price: number;
  stockCost: number;
  stockRetail: number;
}
interface InvTier {
  tier: number;
  name: string;
  markup: number;
  items: InvItem[];
  subtotalCost: number;
  subtotalRetail: number;
}
interface Inventory {
  tiers: InvTier[];
  totalCost: number;
  totalRetail: number;
}

const money = (n: number) => `$${n.toLocaleString('en-US')}`;
const KEY = 'jebi-admin-key';

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
    // Keep this page out of search engines
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

  const submit = (e: FormEvent) => {
    e.preventDefault();
    load();
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
      <span className="eyebrow">Staff only</span>
      <h1 className="mt-3 font-display uppercase text-5xl font-bold text-ink leading-none">JEBI merchandise inventory</h1>
      <p className="mt-3 text-gray-600">Quantities on hand, cost and member pricing. This page is private and not linked from the site.</p>

      {!data && (
        <form onSubmit={submit} className="mt-8 card p-6 hover:translate-y-0 max-w-md">
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
              <p className="text-xs uppercase tracking-[0.2em] text-gold font-bold">If all stock sells (member price)</p>
              <p className="font-display text-4xl font-bold">{money(data.totalRetail)}</p>
            </div>
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
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="text-left px-6 py-3">Item</th>
                      <th className="text-left px-3 py-3">Details</th>
                      <th className="text-right px-3 py-3">Qty on hand</th>
                      <th className="text-right px-3 py-3">Cost each</th>
                      <th className="text-right px-3 py-3">Member price</th>
                      <th className="text-right px-6 py-3">Stock cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {t.items.map((i) => (
                      <tr key={i.id}>
                        <td className="px-6 py-3 font-semibold text-ink">{i.name}</td>
                        <td className="px-3 py-3 text-gray-500">{i.details || '—'}</td>
                        <td className={`px-3 py-3 text-right font-bold ${i.qty <= 2 ? 'text-red-600' : 'text-ink'}`}>{i.qty}</td>
                        <td className="px-3 py-3 text-right">{money(i.cost)}</td>
                        <td className="px-3 py-3 text-right text-jebi font-semibold">{money(i.price)}</td>
                        <td className="px-6 py-3 text-right">{money(i.stockCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-cream font-bold">
                      <td className="px-6 py-3" colSpan={5}>
                        Tier {t.tier} subtotal
                      </td>
                      <td className="px-6 py-3 text-right">{money(t.subtotalCost)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
