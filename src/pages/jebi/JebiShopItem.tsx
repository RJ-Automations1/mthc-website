import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, KeyRound, Lock, Medal, Unlock } from 'lucide-react';
import usePageTitle from './usePageTitle';
import { jebiPath } from '../../lib/siteMode';
import { ITEM_COLORS, ItemImage, money, readUnlocked, useCatalog } from './shopShared';

/** One merchandise item on its own page: big picture, price, tier and lock state. */
export default function JebiShopItem() {
  const { itemId } = useParams();
  const { tiers, error } = useCatalog();
  const [unlocked] = useState<number[]>(readUnlocked);

  const tier = tiers?.find((t) => t.items.some((i) => i.id === itemId));
  const item = tier?.items.find((i) => i.id === itemId);
  usePageTitle(item ? item.name : 'Shop');

  const shell = (children: ReactNode) => (
    <section className="bg-cream pt-28 md:pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-gray-500">
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
  );

  // The page sits on a light background under a fixed, transparent header — give it a backdrop.
  const headerBackdrop = <div className="fixed inset-x-0 top-0 h-20 bg-ink z-40" aria-hidden="true" />;

  if (error) return <>{headerBackdrop}{shell(<p className="text-gray-600">This item couldn't be loaded. Please go back to the shop.</p>)}</>;
  if (!tiers) return <>{headerBackdrop}{shell(<p className="text-gray-500">Loading…</p>)}</>;
  if (!tier || !item)
    return (
      <>
        {headerBackdrop}
        {shell(
          <div className="card p-8 hover:translate-y-0">
            <h1 className="font-display uppercase text-4xl font-bold text-ink">Item not found</h1>
            <p className="mt-2 text-gray-600">That item isn't in the JEBI collection.</p>
            <Link to={jebiPath('/shop')} className="btn-primary mt-6 text-sm uppercase tracking-wider">
              Back to the shop
            </Link>
          </div>,
        )}
      </>
    );

  const open = unlocked.includes(tier.tier);
  const others = tier.items.filter((i) => i.id !== item.id);

  return (
    <>
      {headerBackdrop}
      {shell(
        <>
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <div className="space-y-4">
              <div className="rounded-3xl overflow-hidden bg-white ring-1 ring-black/5 shadow-xl">
                <ItemImage item={item} size="lg" className="w-full aspect-square" />
              </div>
              {ITEM_COLORS[item.id] && (
                <figure className="rounded-2xl overflow-hidden bg-white ring-1 ring-black/5 shadow-sm">
                  <img src={ITEM_COLORS[item.id]} alt={`${item.name} in maroon, gray, white and black`} loading="lazy" className="w-full" />
                  <figcaption className="px-4 py-3 text-sm text-gray-600 flex items-center gap-3">
                    <span className="font-semibold text-ink">Available colors</span>
                    <span className="flex gap-1.5" aria-hidden="true">
                      {['#6b1426', '#9ca3af', '#ffffff', '#111111'].map((c) => (
                        <span key={c} className="w-4 h-4 rounded-full ring-1 ring-black/15" style={{ background: c }} />
                      ))}
                    </span>
                    <span>Maroon · Gray · White · Black</span>
                  </figcaption>
                </figure>
              )}
            </div>

            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-jebi px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white">
                Tier {tier.tier} · {tier.name}
              </span>
              <h1 className="mt-4 font-display uppercase font-bold text-ink text-5xl md:text-6xl leading-[0.9]">{item.name}</h1>
              {item.details && <p className="mt-3 text-lg text-gray-600">{item.details}</p>}
              <p className="mt-6 font-display text-5xl font-bold text-jebi">{money(item.price)}</p>
              <p className="text-sm text-gray-500">per item · Official Jay Edwards Baseball Invitational merchandise</p>

              <div className="mt-8 rounded-2xl bg-white ring-1 ring-black/5 p-6">
                <div className="flex items-start gap-3">
                  <Medal className="w-6 h-6 text-jebi shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-ink">Who can order</p>
                    <p className="mt-1 text-sm text-gray-600">
                      <strong>{tier.sponsors.join(' & ')}</strong> sponsors, or individual gifts of <strong>{tier.individuals}</strong>. A
                      higher-tier code also works.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                {open ? (
                  <div className="rounded-2xl bg-gold/15 ring-1 ring-gold/40 p-5 flex items-center gap-3">
                    <Unlock className="w-6 h-6 text-jebi shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-ink">Unlocked for you</p>
                      <p className="text-sm text-gray-600">Online ordering opens soon — this item will be available to order here.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <Link to={`${jebiPath('/shop')}#access`} className="btn-primary uppercase tracking-wider text-sm">
                      <KeyRound className="w-4 h-4" /> Enter access code
                    </Link>
                    <Link to={jebiPath('/partnerships')} className="btn-secondary uppercase tracking-wider text-sm">
                      Get this tier
                    </Link>
                    <p className="w-full flex items-center gap-2 text-sm text-gray-500">
                      <Lock className="w-4 h-4" aria-hidden="true" /> Members-only — unlock with your Tier {tier.tier} (or higher) access code.
                    </p>
                  </div>
                )}
              </div>

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
                        <p className="mt-1 font-display text-xl font-bold text-jebi">{money(o.price)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>,
      )}
    </>
  );
}
