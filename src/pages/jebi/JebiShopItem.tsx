import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, ChevronRight, CreditCard, ExternalLink, Gift, Medal, ShoppingBag } from 'lucide-react';
import usePageTitle from './usePageTitle';
import { jebiPath } from '../../lib/siteMode';
import {
  ITEM_COLORS,
  ITEM_CREST,
  ItemImage,
  LOW_STOCK,
  money,
  priceLabel,
  markCodeUsed,
  readCode,
  readCodeUsed,
  readUnlocked,
  saveCode,
  useCatalog,
  type CatalogItem,
} from './shopShared';

const MAX_PER_ORDER = 10;

interface OrderResult {
  ref: string;
  item: string;
  option: string | null;
  qty: number;
  total: number;
  payUrl: string | null;
}

/** Shared name / email / phone fields. */
function BuyerFields({ v, set }: { v: { name: string; email: string; phone: string }; set: (k: 'name' | 'email' | 'phone', val: string) => void }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <label className="text-sm font-semibold text-gray-700">
        Full name *
        <input required className="input mt-1" value={v.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
      </label>
      <label className="text-sm font-semibold text-gray-700">
        Email *
        <input required type="email" className="input mt-1" value={v.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
      </label>
      <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
        Phone <span className="font-normal text-gray-400">(optional)</span>
        <input type="tel" className="input mt-1" value={v.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" />
      </label>
    </div>
  );
}

function OptionPicker({ item, value, onChange, free = false }: { item: CatalogItem; value: string; onChange: (id: string) => void; free?: boolean }) {
  if (!item.options?.length) return null;
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-gray-700 mb-2">Style *</legend>
      <div className="flex flex-wrap gap-2">
        {item.options.map((o) => (
          <label
            key={o.id}
            className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold ring-1 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-jebi ${
              value === o.id ? 'bg-jebi text-white ring-jebi' : 'bg-white text-ink ring-black/10 hover:ring-jebi/40'
            }`}
          >
            <input type="radio" name={`opt-${item.id}`} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} className="sr-only" />
            {free ? o.label : `${o.label} · ${money(o.price)}`}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** One merchandise item on its own page: photo, price, stock, buy and claim. */
export default function JebiShopItem() {
  const { itemId } = useParams();
  const { tiers, ordering, error, reload } = useCatalog();
  const [unlocked] = useState<number[]>(readUnlocked);

  const tier = tiers?.find((t) => t.items.some((i) => i.id === itemId));
  const item = tier?.items.find((i) => i.id === itemId);
  usePageTitle(item ? item.name : 'Shop');

  const [optionId, setOptionId] = useState('');
  const [qty, setQty] = useState(1);
  const [buyer, setBuyer] = useState({ name: '', email: '', phone: '' });
  const [code, setCode] = useState(readCode);
  const [codeUsed, setCodeUsed] = useState(readCodeUsed);
  const [busy, setBusy] = useState<'buy' | 'claim' | null>(null);
  const [msg, setMsg] = useState<{ where: 'buy' | 'claim'; text: string } | null>(null);
  const [done, setDone] = useState<(OrderResult & { kind: 'purchase' | 'claim' }) | null>(null);

  // Fresh form whenever the visitor moves to a different item
  useEffect(() => {
    setOptionId('');
    setQty(1);
    setDone(null);
    setMsg(null);
  }, [itemId]);

  useEffect(() => {
    if (item?.options?.length && !item.options.some((o) => o.id === optionId)) setOptionId(item.options[0].id);
  }, [item, optionId]);

  useEffect(() => {
    if (window.location.hash === '#claim' && item) requestAnimationFrame(() => document.getElementById('claim')?.scrollIntoView({ block: 'start' }));
  }, [item]);

  const setField = (k: 'name' | 'email' | 'phone', val: string) => setBuyer((b) => ({ ...b, [k]: val }));

  const send = async (kind: 'purchase' | 'claim') => {
    if (!item) return;
    setBusy(kind === 'purchase' ? 'buy' : 'claim');
    setMsg(null);
    try {
      const r = await fetch(`/api/jebi/shop/${kind === 'purchase' ? 'order' : 'claim'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, optionId: optionId || null, qty, code, ...buyer }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setMsg({ where: kind === 'purchase' ? 'buy' : 'claim', text: d.message || 'Something went wrong. Please try again.' });
        if (r.status === 409) reload();
        return;
      }
      if (kind === 'claim') {
        saveCode(code);
        markCodeUsed();
        setCodeUsed(true);
      }
      setDone({ ...d, kind });
      reload();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setMsg({ where: kind === 'purchase' ? 'buy' : 'claim', text: 'Could not reach the shop. Please try again.' });
    } finally {
      setBusy(null);
    }
  };

  const buy = (e: FormEvent) => {
    e.preventDefault();
    send('purchase');
  };
  const claim = (e: FormEvent) => {
    e.preventDefault();
    send('claim');
  };

  const headerBackdrop = <div className="fixed inset-x-0 top-0 h-20 bg-ink z-40" aria-hidden="true" />;
  const shell = (children: ReactNode) => (
    <>
      {headerBackdrop}
      <section className="bg-cream pt-28 md:pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <Link to={jebiPath('/shop')} className="inline-flex items-center gap-1.5 font-semibold text-jebi hover:underline">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Shop
            </Link>
            {tier && (
              <>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
                <a href={`${jebiPath('/shop')}#tier-${tier.tier}`} className="hover:text-jebi">
                  Tier {tier.tier} · {tier.name}
                </a>
              </>
            )}
            {item && (
              <>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
                <span className="text-ink font-semibold">{item.name}</span>
              </>
            )}
          </nav>
          {children}
        </div>
      </section>
    </>
  );

  if (error) return shell(<p className="text-gray-600">This item couldn't be loaded. Please go back to the shop.</p>);
  if (!tiers) return shell(<p className="text-gray-500">Loading…</p>);
  if (!tier || !item)
    return shell(
      <div className="card p-8 hover:translate-y-0">
        <h1 className="font-display uppercase text-4xl font-bold text-ink">Item not found</h1>
        <p className="mt-2 text-gray-600">That item isn't in the JEBI collection.</p>
        <Link to={jebiPath('/shop')} className="btn-primary mt-6 text-sm uppercase tracking-wider">
          Back to the shop
        </Link>
      </div>,
    );

  const remaining = item.remaining;
  const soldOut = remaining !== null && remaining <= 0;
  const maxQty = Math.max(1, Math.min(MAX_PER_ORDER, remaining ?? MAX_PER_ORDER));
  const unitPrice = item.options?.find((o) => o.id === optionId)?.price ?? item.price;
  const covers = unlocked.includes(tier.tier);
  const others = tier.items.filter((i) => i.id !== item.id);

  // ── Confirmation after buying / claiming ──
  if (done) {
    return shell(
      <div className="max-w-2xl mx-auto card p-8 md:p-10 hover:translate-y-0 text-center">
        <BadgeCheck className="w-14 h-14 text-jebi mx-auto" aria-hidden="true" />
        <h1 className="mt-4 font-display uppercase text-4xl md:text-5xl font-bold text-ink leading-none">
          {done.kind === 'claim' ? 'Item claimed!' : 'Order reserved'}
        </h1>
        <p className="mt-3 text-gray-600">
          {done.qty} × {done.item}
          {done.option ? ` (${done.option})` : ''} · Order <strong className="text-ink">{done.ref}</strong>
        </p>
        {done.kind === 'purchase' && done.payUrl ? (
          <>
            <p className="mt-6 font-display text-5xl font-bold text-jebi">{money(done.total)}</p>
            <p className="mt-2 text-sm text-gray-600">
              Your items are held for you. Complete payment on MTHC's secure Square page — enter <strong>{money(done.total)}</strong> and
              add order <strong>{done.ref}</strong> in the note.
            </p>
            <a href={done.payUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6 uppercase tracking-wider text-sm">
              <CreditCard className="w-4 h-4" /> Pay {money(done.total)} on Square <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </>
        ) : (
          <p className="mt-6 text-gray-600">This item is reserved for you as part of your sponsorship — no payment needed. MTHC will contact you about pickup.</p>
        )}
        <p className="mt-6 text-xs text-gray-500">A copy of these details will be useful at pickup — screenshot this page or note your order number.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to={jebiPath('/shop')} className="btn-secondary text-sm uppercase tracking-wider">
            Back to the shop
          </Link>
          <button type="button" onClick={() => setDone(null)} className="text-sm font-semibold text-jebi hover:underline">
            Order another
          </button>
        </div>
      </div>,
    );
  }

  return shell(
    <>
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* Pictures */}
        <div className="space-y-4 lg:sticky lg:top-28">
          <div className="relative rounded-3xl overflow-hidden bg-white ring-1 ring-black/5 shadow-xl">
            <ItemImage item={item} size="lg" className={`w-full aspect-square ${soldOut ? 'grayscale' : ''}`} />
            {soldOut && (
              <span className="absolute top-5 left-5 rounded-full bg-ink px-4 py-2 text-sm font-bold uppercase tracking-wider text-white">Sold out</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {ITEM_CREST[item.id] && (
              <figure className="rounded-2xl overflow-hidden bg-white ring-1 ring-black/5 shadow-sm">
                <img src={ITEM_CREST[item.id]} alt={`${item.name} with the JEBI crest logo`} loading="lazy" className="w-full aspect-[4/3] object-cover bg-ink" />
                <figcaption className="px-3 py-2 text-xs font-semibold text-ink">Crest logo design</figcaption>
              </figure>
            )}
            {ITEM_COLORS[item.id] && (
              <figure className="rounded-2xl overflow-hidden bg-white ring-1 ring-black/5 shadow-sm">
                <img src={ITEM_COLORS[item.id]} alt={`${item.name} in maroon, gray, white and black`} loading="lazy" className="w-full aspect-[4/3] object-cover" />
                <figcaption className="px-3 py-2 text-xs text-gray-600 flex items-center gap-2">
                  <span className="font-semibold text-ink">Colors</span>
                  {['#6b1426', '#9ca3af', '#ffffff', '#111111'].map((c) => (
                    <span key={c} className="w-3.5 h-3.5 rounded-full ring-1 ring-black/15" style={{ background: c }} aria-hidden="true" />
                  ))}
                </figcaption>
              </figure>
            )}
          </div>
        </div>

        {/* Details + buy / claim */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-jebi px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white">
            Tier {tier.tier} · {tier.name}
          </span>
          <h1 className="mt-4 font-display uppercase font-bold text-ink text-5xl md:text-6xl leading-[0.9]">{item.name}</h1>
          {item.details && <p className="mt-3 text-lg text-gray-600">{item.details}</p>}
          <div className="mt-5 flex flex-wrap items-baseline gap-4">
            <p className="font-display text-5xl font-bold text-jebi">{item.options?.length ? money(unitPrice) : priceLabel(item)}</p>
            {remaining !== null && !soldOut && remaining <= LOW_STOCK && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800">Only {remaining} left</span>
            )}
          </div>

          {soldOut ? (
            <div className="mt-8 rounded-2xl bg-white ring-1 ring-black/5 p-6">
              <p className="font-display uppercase text-2xl font-bold text-ink">Sold out</p>
              <p className="mt-1 text-sm text-gray-600">Every {item.name.toLowerCase().replace(/s$/, '')} has been purchased or claimed.</p>
              <Link to={jebiPath('/shop')} className="btn-secondary mt-4 text-sm uppercase tracking-wider">
                See other items
              </Link>
            </div>
          ) : !ordering ? (
            <div className="mt-8 rounded-2xl bg-white ring-1 ring-black/5 p-6 text-gray-600">Ordering opens soon — check back shortly.</div>
          ) : (
            <>
              {/* Buy */}
              <form onSubmit={buy} className="mt-8 rounded-2xl bg-white ring-1 ring-black/5 p-6 space-y-5">
                <h2 className="flex items-center gap-2 font-display uppercase text-2xl font-bold text-ink">
                  <ShoppingBag className="w-5 h-5 text-jebi" aria-hidden="true" /> Buy
                </h2>
                <OptionPicker item={item} value={optionId} onChange={setOptionId} />
                <label className="block text-sm font-semibold text-gray-700">
                  Quantity
                  <select value={qty} onChange={(e) => setQty(Number(e.target.value))} className="input mt-1 !w-32">
                    {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  {remaining !== null && <span className="ml-3 font-normal text-gray-500">{remaining} available</span>}
                </label>
                <BuyerFields v={buyer} set={setField} />
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <p className="text-sm text-gray-600">
                    Total <span className="font-display text-3xl font-bold text-ink ml-1">{money(unitPrice * qty)}</span>
                  </p>
                  <button type="submit" disabled={busy !== null} className="btn-primary uppercase tracking-wider text-sm disabled:opacity-60">
                    <CreditCard className="w-4 h-4" /> {busy === 'buy' ? 'Reserving…' : 'Reserve & pay'}
                  </button>
                </div>
                {msg?.where === 'buy' && <p role="alert" className="text-sm text-red-600">{msg.text}</p>}
                <p className="text-xs text-gray-500">You'll pay on MTHC's secure Square page. Your items are held while you complete payment.</p>
              </form>

              {/* Claim */}
              <form id="claim" onSubmit={claim} className="scroll-mt-28 mt-6 rounded-2xl bg-gold/10 ring-1 ring-gold/40 p-6 space-y-5">
                <div>
                  <h2 className="flex items-center gap-2 font-display uppercase text-2xl font-bold text-ink">
                    <Gift className="w-5 h-5 text-jebi" aria-hidden="true" /> Sponsors: claim free
                  </h2>
                  <p className="mt-1 flex items-start gap-2 text-sm text-gray-600">
                    <Medal className="w-4 h-4 mt-0.5 text-jebi shrink-0" aria-hidden="true" />
                    <span>
                      For <strong>{tier.sponsors.join(' & ')}</strong> sponsors and individual gifts of <strong>{tier.individuals}</strong> (higher tiers too).
                      <strong> One free item per access code.</strong>
                    </span>
                  </p>
                  {codeUsed && (
                    <p className="mt-3 rounded-xl bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-black/5">
                      The access code used on this device has already claimed its free item. Have a different sponsor code? Enter it below.
                    </p>
                  )}
                </div>
                <OptionPicker item={item} value={optionId} onChange={setOptionId} free />
                <label className="block text-sm font-semibold text-gray-700">
                  Access code *
                  <input
                    required
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setCodeUsed(false);
                    }}
                    placeholder="JEBI1-XXXX-XXXX"
                    autoComplete="off"
                    spellCheck={false}
                    className="input mt-1 uppercase tracking-widest font-semibold"
                  />
                  {covers && !codeUsed && <span className="mt-1 block font-normal text-xs text-jebi">Your code is applied — this is your one free item.</span>}
                </label>
                <BuyerFields v={buyer} set={setField} />
                <div className="flex justify-end">
                  <button type="submit" disabled={busy !== null} className="btn-gold uppercase tracking-wider text-sm disabled:opacity-60">
                    <Gift className="w-4 h-4" /> {busy === 'claim' ? 'Claiming…' : 'Claim free'}
                  </button>
                </div>
                {msg?.where === 'claim' && <p role="alert" className="text-sm text-red-600">{msg.text}</p>}
              </form>
            </>
          )}

          <p className="mt-6 text-xs text-gray-500">
            Produced by Thirty Four (3RTY4.com). Quantities are limited. Product images are mockups — final products and colors may vary.
          </p>
        </div>
      </div>

      {others.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display uppercase text-3xl font-bold text-ink mb-6">More from Tier {tier.tier}</h2>
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {others.map((o) => (
              <li key={o.id}>
                <Link to={jebiPath(`/shop/${o.id}`)} className="group card block hover:translate-y-0">
                  <ItemImage item={o} size="sm" className="w-full aspect-square group-hover:scale-[1.03] transition-transform duration-300" />
                  <div className="p-4">
                    <p className="font-display uppercase text-lg font-bold text-ink leading-none group-hover:text-jebi">{o.name}</p>
                    <p className="mt-1 font-display text-xl font-bold text-jebi">{o.remaining === 0 ? 'Sold out' : priceLabel(o)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>,
  );
}
