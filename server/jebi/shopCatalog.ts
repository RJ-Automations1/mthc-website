// ─────────────────────────────────────────────────────────────────────────────
// JEBI merchandise — SERVER ONLY.
//
// Source: Thirty Four (shop 3RTY4.com) merchandise price list, with MTHC's
// handwritten tier markups and eligibility. Quantity on hand and our cost stay
// here on the backend; the public site only ever receives the member price.
//
//   Member price = cost each + tier markup  (Tier 1 +$15, Tier 2 +$10, Tier 3 +$5)
//
// To update stock: change `qty` and redeploy the jebi service.
// ─────────────────────────────────────────────────────────────────────────────

export interface ShopItem {
  id: string;
  name: string;
  details: string;
  qty: number; // on hand — backend only
  cost: number; // each, from Thirty Four — backend only
}

export interface ShopTier {
  tier: 1 | 2 | 3;
  name: string;
  markup: number;
  sponsors: string[]; // sponsorship levels that receive this tier
  individuals: string; // individual giving range
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
      { id: 'sweatsuit', name: 'Sweatsuits', details: 'Screen print', qty: 8, cost: 75 },
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
      { id: 'hoodie', name: 'Hoodies', details: 'Left-chest embroidery', qty: 10, cost: 30 },
      { id: 'crewneck', name: 'Crewnecks', details: 'Left-chest embroidery', qty: 10, cost: 30 },
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

export const memberPrice = (t: ShopTier, i: ShopItem) => i.cost + t.markup;

/** What the public site may see: no quantities, no costs. */
export const publicCatalog = () =>
  SHOP_TIERS.map((t) => ({
    tier: t.tier,
    name: t.name,
    sponsors: t.sponsors,
    individuals: t.individuals,
    items: t.items.map((i) => ({ id: i.id, name: i.name, details: i.details, price: memberPrice(t, i) })),
    total: t.items.reduce((sum, i) => sum + memberPrice(t, i), 0),
  }));

/** Full inventory for the private admin view. */
export const inventoryReport = () => {
  const tiers = SHOP_TIERS.map((t) => {
    const items = t.items.map((i) => ({
      ...i,
      price: memberPrice(t, i),
      stockCost: i.qty * i.cost,
      stockRetail: i.qty * memberPrice(t, i),
    }));
    return {
      tier: t.tier,
      name: t.name,
      markup: t.markup,
      items,
      subtotalCost: items.reduce((s, i) => s + i.stockCost, 0),
      subtotalRetail: items.reduce((s, i) => s + i.stockRetail, 0),
    };
  });
  return {
    tiers,
    totalCost: tiers.reduce((s, t) => s + t.subtotalCost, 0),
    totalRetail: tiers.reduce((s, t) => s + t.subtotalRetail, 0),
  };
};
