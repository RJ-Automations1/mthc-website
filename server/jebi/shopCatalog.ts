// ─────────────────────────────────────────────────────────────────────────────
// JEBI merchandise — SERVER ONLY.
//
// Source: Thirty Four (shop 3RTY4.com) merchandise price list + tier poster,
// with MTHC's handwritten tier markups and eligibility.
//
//   Price = cost + tier markup  (Tier 1 +$15, Tier 2 +$10, Tier 3 +$5)
//
// `qty` is the starting stock. What's left = qty − everything purchased or
// claimed (see store.ts). To add stock, raise `qty` and redeploy.
// ─────────────────────────────────────────────────────────────────────────────

export interface ShopOption {
  id: string;
  label: string;
  cost: number;
}

export interface ShopItem {
  id: string;
  name: string;
  details: string;
  qty: number; // starting stock — backend only
  cost: number; // default option's cost — backend only
  options?: ShopOption[]; // print styles with their own cost
}

export interface ShopTier {
  tier: 1 | 2 | 3;
  name: string;
  markup: number;
  sponsors: string[];
  individuals: string;
  items: ShopItem[];
}

export const SHOP_TIERS: ShopTier[] = [
  {
    tier: 1,
    name: 'Premium Apparel',
    markup: 15,
    sponsors: ['Title', 'Affiliate'],
    individuals: '$1,001+',
    items: [
      {
        id: 'sweatsuit',
        name: 'Sweatsuits',
        details: 'Hoodie and joggers',
        qty: 8,
        cost: 75,
        options: [
          { id: 'screen-print', label: 'Screen print', cost: 75 },
          { id: 'embroidered', label: 'Embroidered (left chest)', cost: 80 },
        ],
      },
      { id: 'quarter-zip', name: 'Quarter zips', details: 'Left-chest embroidery', qty: 8, cost: 55 },
      { id: 'polo', name: 'Polos', details: 'Embroidery', qty: 8, cost: 40 },
      { id: 'button-up', name: 'Button-ups', details: 'Left-chest embroidery', qty: 8, cost: 40 },
      { id: 'bookbag', name: 'Bookbags', details: 'Embroidery', qty: 5, cost: 50 },
    ],
  },
  {
    tier: 2,
    name: 'Standard Apparel & Gear',
    markup: 10,
    sponsors: ['Homerun', 'Pennant'],
    individuals: '$251 – $1,000',
    items: [
      {
        id: 'hoodie',
        name: 'Hoodies',
        details: 'Embroidered or screen print',
        qty: 10,
        cost: 30,
        options: [
          { id: 'embroidered', label: 'Embroidered (left chest)', cost: 30 },
          { id: 'screen-print', label: 'Screen print', cost: 25 },
        ],
      },
      {
        id: 'crewneck',
        name: 'Crewnecks',
        details: 'Embroidered or screen print',
        qty: 10,
        cost: 30,
        options: [
          { id: 'embroidered', label: 'Embroidered (left chest)', cost: 30 },
          { id: 'screen-print', label: 'Screen print', cost: 25 },
        ],
      },
      { id: 'cap', name: 'Baseball caps', details: 'Embroidery', qty: 10, cost: 30 },
      { id: 'tumbler', name: 'Tumblers', details: '', qty: 10, cost: 20 },
    ],
  },
  {
    tier: 3,
    name: 'Accessories & Add-ons',
    markup: 5,
    sponsors: ['Dugout', 'Diamond'],
    individuals: '$1 – $250',
    items: [
      { id: 'mug', name: 'Mugs', details: '', qty: 10, cost: 10 },
      { id: 'package-1', name: 'Package #1', details: 'Keychain, pen and button', qty: 20, cost: 15 },
      { id: 'package-2', name: 'Package #2', details: 'Lanyard and wristband', qty: 20, cost: 10 },
    ],
  },
];

export const findItem = (id: string) => {
  for (const t of SHOP_TIERS) {
    const item = t.items.find((i) => i.id === id);
    if (item) return { tier: t, item };
  }
  return null;
};

/** Cost of the chosen option (or the item's default). */
export const optionCost = (item: ShopItem, optionId?: string | null) =>
  item.options?.find((o) => o.id === optionId)?.cost ?? item.cost;

export const priceOf = (t: ShopTier, item: ShopItem, optionId?: string | null) => optionCost(item, optionId) + t.markup;

/** What the public site may see: prices and how many are left — never cost. */
export const publicCatalog = (remaining: (id: string) => number | null) =>
  SHOP_TIERS.map((t) => ({
    tier: t.tier,
    name: t.name,
    sponsors: t.sponsors,
    individuals: t.individuals,
    items: t.items.map((i) => ({
      id: i.id,
      name: i.name,
      details: i.details,
      price: priceOf(t, i),
      options: i.options?.map((o) => ({ id: o.id, label: o.label, price: o.cost + t.markup })),
      remaining: remaining(i.id),
    })),
    total: t.items.reduce((sum, i) => sum + priceOf(t, i), 0),
  }));
