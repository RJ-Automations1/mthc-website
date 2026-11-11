import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, ChevronRight, KeyRound, Lock, Medal, Unlock } from 'lucide-react';
import { JebiHero, SectionHeader } from './components';
import { PHOTOS } from '../../lib/photos';
import usePageTitle from './usePageTitle';
import { jebiPath } from '../../lib/siteMode';
import { JEBI } from './data';
import { ItemImage, TIER_IMAGES, money, readUnlocked, saveUnlocked, useCatalog } from './shopShared';

const TIER_STYLE: Record<1 | 2 | 3, { band: string; chip: string; label: string }> = {
  1: { band: 'from-ink via-jebi-dark to-jebi', chip: 'bg-gold text-ink', label: 'Premium' },
  2: { band: 'from-jebi-dark to-jebi', chip: 'bg-white text-jebi', label: 'Standard' },
  3: { band: 'from-jebi to-maroon-600', chip: 'bg-white/90 text-jebi', label: 'Accessories' },
};

export default function JebiShop() {
  usePageTitle('Shop');
  const { tiers, error: loadError } = useCatalog();
  const [filter, setFilter] = useState<'all' | 1 | 2 | 3>('all');
  const [unlocked, setUnlocked] = useState<number[]>(readUnlocked);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<{ kind: 'idle' | 'checking' | 'ok' | 'error'; message?: string }>({ kind: 'idle' });

  // Arriving from an item page with #access or #tier-N: scroll there once the list renders
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id || !tiers) return;
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
  }, [tiers]);

  // A link like /shop?code=JEBI-XXXX unlocks automatically (handy in sponsor emails)
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
      const next = Array.from(new Set([...readUnlocked(), ...d.unlocked])).sort();
      setUnlocked(next);
      saveUnlocked(next);
      setCode('');
      setStatus({
        kind: 'ok',
        message: `Code accepted — Tier ${d.tier} collection unlocked${d.unlocked.length > 1 ? ` (plus Tier ${d.unlocked.filter((t: number) => t !== d.tier).join(' & ')})` : ''}.`,
      });
      document.getElementById(`tier-${d.tier}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      setStatus({ kind: 'error', message: 'Could not check the code right now. Please try again.' });
    }
  };

  const shown = (tiers ?? []).filter((t) => filter === 'all' || t.tier === filter);

  return (
    <>
      <JebiHero
        eyebrow="Shop"
        title="Official JEBI Collection"
        subtitle="Exclusive Jay Edwards Baseball Invitational merchandise — reserved for our sponsors and donors."
        image={PHOTOS.jebiShopHero}
      >
        <div className="flex flex-wrap gap-3">
          <a href="#access" className="btn-gold uppercase tracking-wider text-sm">
            <KeyRound className="w-4 h-4" /> Enter Access Code
          </a>
          <Link to={jebiPath('/partnerships')} className="btn-ghost-light uppercase tracking-wider text-sm">
            Get a Tier
          </Link>
        </div>
      </JebiHero>

      {/* How it works */}
      <section className="container-page">
        <SectionHeader eyebrow="How it works" title="Members-only merchandise">
          The JEBI collection is available by tier. Support the Invitational, receive your access code, and unlock your
          tier's collection.
        </SectionHeader>
        <ol className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Medal, title: 'Get your tier', text: 'Become a sponsor or make an individual gift. Your level decides your tier.' },
            { icon: KeyRound, title: 'Receive your code', text: 'MTHC sends you a personal access code for your tier.' },
            { icon: Unlock, title: 'Unlock & order', text: 'Enter the code below to unlock your collection. Online ordering opens soon.' },
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
            <span className="eyebrow text-gold">Access code</span>
            <h2 className="mt-3 font-display uppercase text-4xl md:text-5xl font-bold leading-none">Unlock your collection</h2>
            <p className="mt-3 text-white/70">
              Enter the access code you received after getting your tier. A higher tier also unlocks the tiers below it.
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
                placeholder="e.g. JEBI-XXXX-XXXX"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                className="input !bg-white/10 !border-white/20 !text-white placeholder:text-white/40 uppercase tracking-widest font-semibold flex-1"
              />
              <button type="submit" disabled={status.kind === 'checking'} className="btn-gold uppercase tracking-wider text-sm disabled:opacity-60">
                <KeyRound className="w-4 h-4" /> {status.kind === 'checking' ? 'Checking…' : 'Unlock'}
              </button>
            </div>
            <div aria-live="polite" className="min-h-[1.5rem] mt-3 text-sm">
              {status.kind === 'ok' && (
                <p className="flex items-center gap-2 text-gold">
                  <BadgeCheck className="w-4 h-4" aria-hidden="true" /> {status.message}
                </p>
              )}
              {status.kind === 'error' && <p className="text-red-300">{status.message}</p>}
            </div>
            {unlocked.length > 0 && (
              <p className="text-xs text-white/50">
                Unlocked on this device: {unlocked.map((t) => `Tier ${t}`).join(', ')}
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Tiers */}
      <section className="container-page">
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
            const open = unlocked.includes(t.tier);
            const style = TIER_STYLE[t.tier];
            return (
              <article id={`tier-${t.tier}`} key={t.tier} className="scroll-mt-28 rounded-3xl overflow-hidden bg-white ring-1 ring-black/5 shadow-sm">
                {/* Tier banner — collection photo, or a branded banner until one is supplied */}
                <div className={`relative h-56 md:h-72 overflow-hidden bg-gradient-to-r ${style.band}`}>
                  {TIER_IMAGES[t.tier] ? (
                    <img
                      src={TIER_IMAGES[t.tier]!}
                      alt={`${t.name} collection`}
                      style={{ objectPosition: 'center 22%' }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-end pr-8 md:pr-16">
                      <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:16px_16px]" />
                      <img src={JEBI.logo} alt="" className="relative h-[85%] w-auto drop-shadow-2xl" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>

                {/* Tier header */}
                <div className={`bg-gradient-to-r ${style.band} text-white px-6 md:px-8 py-6 flex flex-col lg:flex-row lg:items-center gap-5 -mt-px`}>
                  <div className="flex items-center gap-4 flex-1">
                    <span className={`rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] ${style.chip}`}>Tier {t.tier}</span>
                    <div>
                      <h3 className="font-display uppercase text-3xl md:text-4xl font-bold leading-none">{t.name}</h3>
                      <p className="mt-1.5 text-sm text-white/75">
                        Unlocked by <strong className="text-white">{t.sponsors.join(' & ')}</strong> sponsors · individual gifts of{' '}
                        <strong className="text-white">{t.individuals}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {open ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold">
                        <Unlock className="w-4 h-4 text-gold" aria-hidden="true" /> Unlocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full bg-black/25 px-4 py-2 text-sm font-bold">
                        <Lock className="w-4 h-4" aria-hidden="true" /> Access code required
                      </span>
                    )}
                  </div>
                </div>

                {/* Items */}
                <ul className="divide-y divide-gray-100">
                  {t.items.map((item) => {
                    const href = jebiPath(`/shop/${item.id}`);
                    return (
                      <li key={item.id} className="group px-6 md:px-8 py-4 grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto] items-center gap-4 hover:bg-cream/60 transition-colors">
                        <Link to={href} className="block w-20 h-20 rounded-2xl overflow-hidden ring-1 ring-black/5 shadow-sm" tabIndex={-1} aria-hidden="true">
                          <ItemImage item={item} size="sm" className="w-full h-full group-hover:scale-105 transition-transform duration-300" />
                        </Link>
                        <Link to={href} className="min-w-0">
                          <p className="font-display uppercase text-xl font-bold text-ink leading-none group-hover:text-jebi transition-colors">
                            {item.name}
                          </p>
                          {item.details && <p className="mt-1 text-sm text-gray-500">{item.details}</p>}
                          <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-jebi">
                            View item <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                          </span>
                        </Link>
                        <p className="font-display text-2xl font-bold text-jebi text-right">{money(item.price)}</p>
                        <div className="col-span-3 md:col-span-1 md:w-56 flex md:justify-end whitespace-nowrap">
                          {open ? (
                            <span
                              className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink"
                              title="Online ordering opens soon"
                            >
                              <Unlock className="w-3.5 h-3.5 text-jebi" aria-hidden="true" /> Ordering opens soon
                            </span>
                          ) : (
                            <a
                              href="#access"
                              className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-200"
                            >
                              <Lock className="w-3.5 h-3.5" aria-hidden="true" /> Access code
                            </a>
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
                  <div className="flex items-center gap-4">
                    <p className="font-display text-3xl font-bold text-ink">{money(t.total)}</p>
                    {!open && (
                      <Link to={jebiPath('/partnerships')} className="btn-primary !py-2 !px-4 text-xs uppercase tracking-wider">
                        Get this tier
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-xs text-gray-500 max-w-3xl">
          Prices are per item. Merchandise is produced by Thirty Four (3RTY4.com); quantities are limited. Product images and
          final colors may vary.
        </p>
      </section>

      {/* Mockup */}
      <section className="bg-white border-y border-black/5">
        <div className="container-page grid lg:grid-cols-2 gap-10 items-center">
          <figure>
            <img
              src={PHOTOS.jebiMerch.src}
              alt="Jay Edwards Baseball Invitational branded keepsakes: mugs, tumbler, keychains, buttons, pens, lanyards, wristbands and backpack"
              className="rounded-3xl w-full shadow-xl ring-1 ring-black/5"
            />
            <figcaption className="mt-3 text-xs text-gray-500">Product mockup — final products, colors, and availability may vary.</figcaption>
          </figure>
          <div>
            <SectionHeader eyebrow="Commemorative gifts" title="Wear the legacy">
              Maroon, gray, black, and white apparel alongside branded keepsakes — the perfect way to remember the
              inaugural Invitational.
            </SectionHeader>
            <Link to={jebiPath('/partnerships')} className="btn-primary -mt-4 uppercase tracking-wider text-sm">
              See sponsorship levels
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
