import { useState } from 'react';
import { Shirt, Crown, KeyRound, Gift, ShoppingBag } from 'lucide-react';
import { JEBI } from './data';
import { JebiHero, MaybeLink, SectionHeader } from './components';
import { PHOTOS } from '../../lib/photos';
import usePageTitle from './usePageTitle';

const CATEGORIES = [
  { id: 'apparel', label: 'Apparel', icon: Shirt, items: ['Quarter-zips', 'Polos', 'Button-ups', 'Hoodies', 'Crewnecks', 'Sweatsuits'] },
  { id: 'headwear', label: 'Headwear', icon: Crown, items: ['Caps', 'Fitted hats', 'Beanies'] },
  { id: 'accessories', label: 'Accessories', icon: KeyRound, items: ['Lanyards', 'Wristbands', 'Backpacks', 'Pens'] },
  { id: 'keepsakes', label: 'Keepsakes', icon: Gift, items: ['Mugs', 'Tumblers', 'Keychains', 'Buttons'] },
];

export default function JebiShop() {
  usePageTitle('Shop');
  const [cat, setCat] = useState(CATEGORIES[0].id);
  const active = CATEGORIES.find((c) => c.id === cat)!;

  return (
    <>
      <JebiHero
        eyebrow="Shop"
        title="Official JEBI Collection"
        subtitle="Commemorative apparel and keepsakes from the inaugural Jay Edwards Baseball Invitational."
        image={PHOTOS.jebiShopHero}
      >
        <MaybeLink
          href={JEBI.shopUrl}
          className="btn-gold uppercase tracking-wider text-sm"
          pendingClassName="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white/60"
          pendingLabel="Store opening soon"
        >
          <ShoppingBag className="w-4 h-4" /> Shop Now
        </MaybeLink>
      </JebiHero>

      <section className="container-page grid lg:grid-cols-2 gap-10 items-center">
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
            The official event collection features maroon, gray, black, and white apparel alongside branded keepsakes —
            the perfect way to remember the inaugural Invitational.
          </SectionHeader>
          <p className="-mt-4 text-sm text-gray-500">
            Pricing, sizes, and ordering details will be posted when the store opens.
          </p>
        </div>
      </section>

      <section className="bg-white border-y border-black/5">
        <div className="container-page">
          <div role="tablist" aria-label="Product categories" className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                role="tab"
                type="button"
                id={`tab-${c.id}`}
                aria-selected={cat === c.id}
                aria-controls={`panel-${c.id}`}
                onClick={() => setCat(c.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition ${
                  cat === c.id ? 'bg-jebi text-white shadow' : 'bg-cream text-ink/70 ring-1 ring-black/10 hover:text-jebi'
                }`}
              >
                <c.icon className="w-4 h-4" aria-hidden="true" /> {c.label}
              </button>
            ))}
          </div>
          <ul id={`panel-${active.id}`} role="tabpanel" aria-labelledby={`tab-${active.id}`} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {active.items.map((item) => (
              <li key={item} className="card p-5 flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-jebi/5 flex items-center justify-center">
                  <active.icon className="w-8 h-8 text-jebi" aria-hidden="true" />
                </div>
                <span className="font-display uppercase text-lg font-bold text-ink leading-tight">{item}</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Price TBA</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page grid md:grid-cols-3 gap-6 text-sm">
        {[
          ['Fulfillment', 'Shipping and event pickup options will be listed at checkout.'],
          ['Size chart', 'Sizing guides will be posted with each apparel item.'],
          ['Returns & support', 'Return policy and merchandise support contacts will be posted when the store opens.'],
        ].map(([t, d]) => (
          <div key={t}>
            <h3 className="font-display uppercase text-xl font-bold text-ink">{t}</h3>
            <p className="mt-2 text-gray-600">{d}</p>
          </div>
        ))}
      </section>
    </>
  );
}
