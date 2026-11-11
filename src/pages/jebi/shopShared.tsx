import { useEffect, useState } from 'react';
import { Backpack, Coffee, Crown, CupSoda, Package, Shirt, type LucideIcon } from 'lucide-react';
import { JEBI } from './data';

// ── Types from GET /api/jebi/shop/catalog (no quantities — those stay on the server) ──
export interface CatalogItem {
  id: string;
  name: string;
  details: string;
  price: number;
}
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
  const [error, setError] = useState(false);
  useEffect(() => {
    fetch('/api/jebi/shop/catalog')
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((d) => setTiers(d.tiers))
      .catch(() => setError(true));
  }, []);
  return { tiers, error };
}

const STORAGE_KEY = 'jebi-shop-unlocked';

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
