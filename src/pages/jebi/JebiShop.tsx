import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, ChevronRight, CreditCard, Gift, KeyRound, PackageCheck, ShoppingBag, Unlock } from 'lucide-react';
import { JebiHero, SectionHeader } from './components';
import { PHOTOS } from '../../lib/photos';
import usePageTitle from './usePageTitle';
import { jebiPath } from '../../lib/siteMode';
import { JEBI } from './data';
import {
  ItemImage,
  LOW_STOCK,
  TIER_IMAGES,
  TierWelcome,
  clearCodeUsed,
  markCodeUsed,
  money,
  priceLabel,
  readUnlocked,
  saveCode,
  saveUnlocked,
  useCatalog,
  type CatalogItem,
} from './shopShared';

const TIER_STYLE: Record<1 | 2 | 3, { band: string; chip: string }> = {
  1: { band: 'from-ink via-jebi-dark to-jebi', chip: 'bg-gold text-ink' },
  2: { band: 'from-jebi-dark to-jebi', chip: 'bg-white text-jebi' },
  3: { band: 'from-jebi to-maroon-600', chip: 'bg-white/90 text-jebi' },
};

function StockBadge({ item }: { item: CatalogItem }) {
  if (item.remaining === null) return null;
  if (item.remaining <= 0)
    return <span className="rounded-full bg-gray-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Sold out</span>;
  if (item.remaining <= LOW_STOCK)
    return <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">Only {item.remaining} left</span>;
  return null;
}

export default function JebiShop() {
  usePageTitle('Shop');
  const { tiers, error: loadError } = useCatalog();
  const [filter, setFilter] = useState<'all' | 1 | 2 | 3>('all');
  const [unlocked, setUnlocked] = useState<number[]>(readUnlocked);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<{ kind: 'idle' | 'checking' | 'ok' | 'error'; message?: string }>({ kind: 'idle' });
  const [welcome, setWelcome] = useState<{ tier: 1 | 2 | 3; usedRef: string | null } | null>(null);
  const closeWelcome = useCallback(() => setWelcome(null), []);
  const chooseItem = useCallback(() => {
    const t = welcome?.tier;
    setWelcome(null);
    if (t) {
      setFilter('all');
      requestAnimationFrame(() => document.getElementById(`tier-${t}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }, [welcome]);

  // Arriving with #access or #tier-N: scroll there once the list renders
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id || !tiers) return;
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
  }, [tiers]);

  // A link like /shop?code=JEBI1-XXXX-XXXX unlocks automatically (handy in sponsor emails)
  useEffect(() => {
    const fromLink = new URLSearchParams(window.location.search).get('code');
    if (fromLink) {
      unlock(fromLink);
      window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (code.trim()) unlock(code);
  };

  const unlock = async (value: string) => {
    setStatus({ kind: 'checking' });
    try {
      const r = await fetch('/api/jebi/shop/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: value }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        setStatus({ kind: 'error', message: d.message || "That code wasn't recognized." });
        return;
      }
      saveCode(value);
      setCode('');
      if (d.used) {
        markCodeUsed();
        setUnlocked([]);
        setStatus({ kind: 'ok', message: `Tier ${d.tier} code — its free item has already been claimed (order ${d.usedRef}).` });
      } else {
        clearCodeUsed();
        setUnlocked(d.unlocked);
        saveUnlocked(d.unlocked);
        setStatus({ kind: 'ok', message: `Tier ${d.tier} code accepted — pick one item and choose "Claim free".` });
      }
      setWelcome({ tier: d.tier, usedRef: d.used ? d.usedRef : null });
    } catch {
      setStatus({ kind: 'error', message: 'Could not check the code right now. Please try again.' });
    }
  };

  const shown = (tiers ?? []).filter((t) => filter === 'all' || t.tier === filter);

  return (
    <>
      {welcome && <TierWelcome tier={welcome.tier} usedRef={welcome.usedRef} onChoose={chooseItem} onClose={closeWelcome} />}
      <JebiHero
        eyebrow="Shop"
        title="Official JEBI Collection"
        subtitle="Commemorative apparel and keepsakes from the inaugural Jay Edwards Baseball Invitational. Quantities are limited."
        image={PHOTOS.jebiShopHero}
      >
        <div className="flex flex-wrap gap-3">
          <a href="#collection" className="btn-gold uppercase tracking-wider text-sm">
            <ShoppingBag className="w-4 h-4" /> Shop the collection
          </a>
          <a href="#access" className="btn-ghost-light uppercase tracking-wider text-sm">
            <KeyRound className="w-4 h-4" /> Sponsor access code
          </a>
        </div>
      </JebiHero>

      {/* How it works */}
      <section className="container-page">
        <SectionHeader eyebrow="How it works" title="Buy or claim your gear">
          Anyone can purchase from the collection. Sponsors and donors receive an access code to claim items from their
          tier free.
        </SectionHeader>
        <ol className="grid md:grid-cols-3 gap-5">
          {[
            { icon: ShoppingBag, title: 'Pick your item', text: 'Choose an item, style and quantity. You can only order what’s in stock.' },
            { icon: CreditCard, title: 'Pay securely', text: 'Your order is reserved, then you pay the total on MTHC’s secure Square page.' },
            { icon: Gift, title: 'Sponsors claim free', text: 'Have an access code? Enter it to claim an item from your tier at no charge.' },
          ].map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="card p-6 flex gap-4 hover:translate-y-0">
              <div className="w-12 h-12 rounded-2xl bg-jebi text-white flex items-center justify-center shrink-0 relative">
                <Icon className="w-6 h-6" aria-hidden="true" />
                <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-gold text-ink text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <div>
                <h3 className="font-display uppercase text-2xl font-bold text-ink leading-none">{title}</h3>
                <p className="mt-2 text-sm text-gray-600">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Access code */}
      <section id="access" className="scroll-mt-28 bg-ink text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5">
            <span className="eyebrow text-gold">Sponsors & donors</span>
            <h2 className="mt-3 font-display uppercase text-4xl md:text-5xl font-bold leading-none">Claim with your access code</h2>
            <p className="mt-3 text-white/70">
              Enter the code you received with your sponsorship or gift. A higher tier also covers the tiers below it.
            </p>
          </div>
          <form onSubmit={submit} className="lg:col-span-7">
            <label htmlFor="access-code" className="block text-sm font-semibold text-white/80 mb-2">
              Access code
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="access-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. JEBI1-XXXX-XXXX"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                className="input !bg-white/10 !border-white/20 !text-white placeholder:text-white/40 uppercase tracking-widest font-semibold flex-1"
              />
              <button type="submit" disabled={status.kind === 'checking'} className="btn-gold uppercase tracking-wider text-sm disabled:opacity-60">
                <KeyRound className="w-4 h-4" /> {status.kind === 'checking' ? 'Checking…' : 'Apply code'}
              </button>
            </div>
            <div aria-live="polite" className="min-h-[1.5rem] mt-3 text-sm">
              {status.kind === 'ok' && (
                <p className="flex items-center gap-2 text-gold">
                  <BadgeCheck className="w-4 h-4 shrink-0" aria-hidden="true" /> {status.message}
                </p>
              )}
              {status.kind === 'error' && <p className="text-red-300">{status.message}</p>}
            </div>
            {unlocked.length > 0 && <p className="text-xs text-white/50">Code applied on this device: claim Tier {unlocked.join(', ')} items free</p>}
          </form>
        </div>
      </section>

      {/* Tiers */}
      <section id="collection" className="container-page scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <SectionHeader eyebrow="The collection" title="Shop by tier" />
          <div role="group" aria-label="Filter by tier" className="flex flex-wrap gap-2 md:mb-10">
            {(['all', 1, 2, 3] as const).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition ${
                  filter === f ? 'bg-jebi text-white shadow' : 'bg-white text-ink/70 ring-1 ring-black/10 hover:text-jebi'
                }`}
              >
                {f === 'all' ? 'All Tiers' : `Tier ${f}`}
              </button>
            ))}
          </div>
        </div>

        {loadError && (
          <p role="alert" className="rounded-2xl bg-white ring-1 ring-black/5 px-6 py-8 text-center text-gray-600">
            The collection couldn't be loaded right now. Please refresh the page.
          </p>
        )}
        {!tiers && !loadError && <p className="text-gray-500">Loading the collection…</p>}

        <div className="space-y-10">
          {shown.map((t) => {
            const canClaim = unlocked.includes(t.tier);
            const style = TIER_STYLE[t.tier];
            return (
              <article id={`tier-${t.tier}`} key={t.tier} className="scroll-mt-28 rounded-3xl overflow-hidden bg-white ring-1 ring-black/5 shadow-sm">
                {/* Tier banner */}
                <div className={`relative h-60 md:h-96 overflow-hidden bg-gradient-to-r ${style.band}`}>
                  {TIER_IMAGES[t.tier] ? (
                    <img
                      src={TIER_IMAGES[t.tier]!}
                      alt={`${t.name} collection`}
                      style={{ objectPosition: t.tier === 3 ? 'center 45%' : 'center 30%' }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-end pr-8 md:pr-16">
                      <img src={JEBI.logo} alt="" className="relative h-[85%] w-auto drop-shadow-2xl" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Tier header */}
                <div className={`bg-gradient-to-r ${style.band} text-white px-6 md:px-8 py-6 flex flex-col lg:flex-row lg:items-center gap-5 -mt-px`}>
                  <div className="flex items-center gap-4 flex-1">
                    <span className={`rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] ${style.chip}`}>Tier {t.tier}</span>
                    <div>
                      <h3 className="font-display uppercase text-3xl md:text-4xl font-bold leading-none">{t.name}</h3>
                      <p className="mt-1.5 text-sm text-white/75">
                        Free with a code for <strong className="text-white">{t.sponsors.join(' & ')}</strong> sponsors · individual gifts of{' '}
                        <strong className="text-white">{t.individuals}</strong>
                      </p>
                    </div>
                  </div>
                  {canClaim && (
                    <span className="inline-flex items-center gap-2 self-start lg:self-auto rounded-full bg-white/15 px-4 py-2 text-sm font-bold">
                      <Unlock className="w-4 h-4 text-gold" aria-hidden="true" /> Pick 1 free item
                    </span>
                  )}
                </div>

                {/* Items */}
                <ul className="divide-y divide-gray-100">
                  {t.items.map((item) => {
                    const href = jebiPath(`/shop/${item.id}`);
                    const soldOut = item.remaining !== null && item.remaining <= 0;
                    return (
                      <li
                        key={item.id}
                        className={`group px-6 md:px-8 py-4 grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto] items-center gap-4 hover:bg-cream/60 transition-colors ${soldOut ? 'opacity-70' : ''}`}
                      >
                        <Link to={href} className="relative block w-20 h-20 rounded-2xl overflow-hidden ring-1 ring-black/5 shadow-sm" tabIndex={-1} aria-hidden="true">
                          <ItemImage item={item} size="sm" className={`w-full h-full group-hover:scale-105 transition-transform duration-300 ${soldOut ? 'grayscale' : ''}`} />
                        </Link>
                        <Link to={href} className="min-w-0">
                          <p className="flex flex-wrap items-center gap-2">
                            <span className="font-display uppercase text-xl font-bold text-ink leading-none group-hover:text-jebi transition-colors">{item.name}</span>
                            <StockBadge item={item} />
                          </p>
                          {item.details && <p className="mt-1 text-sm text-gray-500">{item.details}</p>}
                          <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-jebi">
                            View item <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                          </span>
                        </Link>
                        <p className="font-display text-2xl font-bold text-jebi text-right whitespace-nowrap">{priceLabel(item)}</p>
                        <div className="col-span-3 md:col-span-1 md:w-60 flex gap-2 md:justify-end whitespace-nowrap">
                          {soldOut ? (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                              Sold out
                            </span>
                          ) : (
                            <>
                              {canClaim && (
                                <Link
                                  to={`${href}#claim`}
                                  className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink hover:bg-gold-light"
                                >
                                  <Gift className="w-3.5 h-3.5" aria-hidden="true" /> Claim free
                                </Link>
                              )}
                              <Link
                                to={href}
                                className="inline-flex items-center gap-1.5 rounded-full bg-jebi px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-jebi-dark"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" /> Buy
                              </Link>
                            </>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* Tier total */}
                <div className="bg-cream px-6 md:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-black/5">
                  <p className="text-sm text-gray-600">
                    <span className="font-display uppercase text-lg font-bold text-ink mr-2">Tier {t.tier} subtotal</span>
                    one of every item in this collection
                  </p>
                  <p className="font-display text-3xl font-bold text-ink">{money(t.total)}</p>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-8 flex items-start gap-2 text-xs text-gray-500 max-w-3xl">
          <PackageCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
          Quantities are limited — once an item's stock is purchased or claimed it is sold out. Merchandise is produced by
          Thirty Four (3RTY4.com). Product images are mockups; final colors may vary.
        </p>
      </section>
    </>
  );
}
