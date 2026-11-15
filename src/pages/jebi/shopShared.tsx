import { useEffect, useState } from 'react';
import { Backpack, Coffee, Crown, CupSoda, Package, Shirt, type LucideIcon } from 'lucide-react';
import { JEBI } from './data';

// ── Types from GET /api/jebi/shop/catalog (no quantities — those stay on the server) ──
export interface CatalogOption {
  id: string;
  label: string;
  price: number;
}
export interface CatalogItem {
  id: string;
  name: string;
  details: string;
  price: number;
  options?: CatalogOption[];
  remaining: number | null; // null = stock not available (ordering closed)
}

/** "$35" or "From $35" when print options have different prices. */
export const priceLabel = (item: CatalogItem) => {
  if (!item.options?.length) return money(item.price);
  const lo = Math.min(...item.options.map((o) => o.price));
  const hi = Math.max(...item.options.map((o) => o.price));
  return lo === hi ? money(lo) : `From ${money(lo)}`;
};

export const LOW_STOCK = 3;
export interface CatalogTier {
  tier: 1 | 2 | 3;
  name: string;
  sponsors: string[];
  individuals: string;
  items: CatalogItem[];
  total: number;
}

export const money = (n: number) => `$${n.toLocaleString('en-US')}`;

// ── Pictures ────────────────────────────────────────────────────────────────
// Keepsake photos are cut from the official merchandise mockup; apparel from the
// Thirty Four apparel mockup. An item without a photo shows a branded placeholder.
const P = '/images/jebi/shop';
export const ITEM_IMAGES: Record<string, string | null> = {
  sweatsuit: `${P}/sweatsuit.jpg`,
  'quarter-zip': `${P}/quarter-zip.jpg`,
  polo: `${P}/polo.jpg`,
  'button-up': `${P}/button-up.jpg`,
  bookbag: `${P}/bookbag.jpg`,
  hoodie: `${P}/hoodie.jpg`,
  crewneck: `${P}/crewneck.jpg`,
  cap: `${P}/cap.jpg`,
  tumbler: `${P}/tumbler.jpg`,
  mug: `${P}/mug.jpg`,
  'package-1': `${P}/package-1.jpg`,
  'package-2': `${P}/package-2.jpg`,
};

/** Full colour line-up shown on an item's page (apparel comes in four colours). */
export const ITEM_COLORS: Record<string, string> = {
  sweatsuit: `${P}/sweatsuit-colors.jpg`,
  'quarter-zip': `${P}/quarter-zip-colors.jpg`,
  polo: `${P}/polo-colors.jpg`,
  'button-up': `${P}/button-up-colors.jpg`,
  hoodie: `${P}/hoodie-colors.jpg`,
  crewneck: `${P}/crewneck-colors.jpg`,
};

/** Crest-logo version of each apparel item (from the JEBI tier poster). */
export const ITEM_CREST: Record<string, string> = {
  sweatsuit: `${P}/sweatsuit-crest.jpg`,
  'quarter-zip': `${P}/quarter-zip-crest.jpg`,
  polo: `${P}/polo-crest.jpg`,
  'button-up': `${P}/button-up-crest.jpg`,
  hoodie: `${P}/hoodie-crest.jpg`,
  crewneck: `${P}/crewneck-crest.jpg`,
  cap: `${P}/cap-crest.jpg`,
};

/** Banner photo across the top of each tier (null = branded banner). */
export const TIER_IMAGES: Record<1 | 2 | 3, string | null> = {
  1: `${P}/tier-1.jpg`,
  2: `${P}/tier-2.jpg`,
  3: `${P}/tier-3.jpg`,
};

const ICONS: Record<string, LucideIcon> = {
  bookbag: Backpack,
  cap: Crown,
  tumbler: CupSoda,
  mug: Coffee,
  'package-1': Package,
  'package-2': Package,
};
export const iconFor = (id: string) => ICONS[id] ?? Shirt;

/** Item picture, or a branded placeholder tile when no photo exists yet. */
export function ItemImage({ item, className = '', size = 'md' }: { item: CatalogItem; className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const src = ITEM_IMAGES[item.id];
  if (src) {
    return <img src={src} alt={`${item.name} — Jay Edwards Baseball Invitational`} loading="lazy" className={`object-cover bg-[#ededed] ${className}`} />;
  }
  const Icon = iconFor(item.id);
  const logo = { sm: 'w-3/5', md: 'w-1/2', lg: 'w-2/5' }[size];
  return (
    <div
      role="img"
      aria-label={`${item.name} — photo coming soon`}
      className={`relative flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-jebi-dark via-jebi to-jebi-dark overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:14px_14px]" />
      <img src={JEBI.logo} alt="" className={`${logo} drop-shadow-lg relative`} />
      {size !== 'sm' && (
        <span className="relative inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
          <Icon className="w-3.5 h-3.5" aria-hidden="true" /> Photo coming soon
        </span>
      )}
    </div>
  );
}

// ── Catalog + unlock state ──────────────────────────────────────────────────
export function useCatalog() {
  const [tiers, setTiers] = useState<CatalogTier[] | null>(null);
  const [ordering, setOrdering] = useState(false);
  const [payUrl, setPayUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    fetch('/api/jebi/shop/catalog')
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((d) => {
        setTiers(d.tiers);
        setOrdering(Boolean(d.ordering));
        setPayUrl(d.payUrl ?? null);
      })
      .catch(() => setError(true));
  }, [version]);
  return { tiers, ordering, payUrl, error, reload: () => setVersion((v) => v + 1) };
}

const STORAGE_KEY = 'jebi-shop-unlocked';
const CODE_KEY = 'jebi-shop-code';

/** The visitor's access code for this visit, so they can claim without retyping it. */
export function readCode(): string {
  try {
    return sessionStorage.getItem(CODE_KEY) || '';
  } catch {
    return '';
  }
}
export function saveCode(code: string) {
  try {
    sessionStorage.setItem(CODE_KEY, code.trim().toUpperCase());
  } catch {
    /* ignore */
  }
}

/** Marks this visit's code as spent (its one free item has been claimed). */
export function markCodeUsed() {
  saveUnlocked([]);
  try {
    sessionStorage.setItem(`${CODE_KEY}-used`, '1');
  } catch {
    /* ignore */
  }
}
export function readCodeUsed() {
  try {
    return sessionStorage.getItem(`${CODE_KEY}-used`) === '1';
  } catch {
    return false;
  }
}
export function clearCodeUsed() {
  try {
    sessionStorage.removeItem(`${CODE_KEY}-used`);
  } catch {
    /* ignore */
  }
}

/** Thank-you pop-up shown when a sponsor enters their access code. */
export function TierWelcome({
  tier,
  usedRef,
  onChoose,
  onClose,
}: {
  tier: 1 | 2 | 3;
  usedRef: string | null;
  onChoose: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.getElementById('tier-welcome-primary')?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const covers = tier === 3 ? 'Tier 3' : tier === 2 ? 'Tier 2 or Tier 3' : 'Tier 1, 2 or 3';
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="tier-welcome-title">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-default" />
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl animate-fade-up">
        <div className="relative bg-gradient-to-br from-ink via-jebi-dark to-jebi px-8 pt-8 pb-6 text-center">
          <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:14px_14px]" />
          <img src={JEBI.logo} alt="Jay Edwards Baseball Invitational" className="relative mx-auto h-28 w-auto drop-shadow-xl" />
          <span className="relative mt-4 inline-block rounded-full bg-gold px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-ink">
            Tier {tier} member
          </span>
        </div>
        <div className="px-8 py-7 text-center">
          <h2 id="tier-welcome-title" className="font-display uppercase text-3xl md:text-4xl font-bold text-ink leading-none">
            Thank you for your support!
          </h2>
          {usedRef ? (
            <p className="mt-4 text-gray-600">
              Thank you for being a <strong>Tier {tier}</strong> member. Your free item has already been claimed (order{' '}
              <strong className="text-ink">{usedRef}</strong>). You're always welcome to purchase additional items from the collection.
            </p>
          ) : (
            <p className="mt-4 text-gray-600">
              Thank you for being a <strong>Tier {tier}</strong> member of the Jay Edwards Baseball Invitational. Please select{' '}
              <strong>one item</strong> from the {covers} collection — it's yours <strong>free</strong> as our thank-you. We truly
              appreciate your support.
            </p>
          )}
          <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
            <button id="tier-welcome-primary" type="button" onClick={onChoose} className="btn-primary uppercase tracking-wider text-sm">
              {usedRef ? 'Browse the collection' : 'Choose my free item'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary uppercase tracking-wider text-sm">
              Close
            </button>
          </div>
          {!usedRef && <p className="mt-4 text-xs text-gray-500">One free item per access code · while supplies last</p>}
        </div>
      </div>
    </div>
  );
}

export function readUnlocked(): number[] {
  try {
    const v = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(v) ? v.filter((n) => [1, 2, 3].includes(n)) : [];
  } catch {
    return [];
  }
}

export function saveUnlocked(tiers: number[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tiers));
  } catch {
    /* storage unavailable — unlock still works for this visit */
  }
}
