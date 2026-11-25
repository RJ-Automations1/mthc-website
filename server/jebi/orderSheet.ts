import type { OrderEmailData } from './orderEmail';

/**
 * Keeps the "JEBI Shop Orders" Google Sheet up to date.
 *
 * JEBI_ORDER_SHEET_URL is the web-app URL of a small Apps Script attached to
 * the sheet (see docs/jebi-order-sheet.gs). JEBI_ORDER_SHEET_SECRET must match
 * the SECRET in that script. Every new order adds a row; status changes
 * (paid / fulfilled / cancelled) update that row's Status column.
 * Failures are logged and never affect the order.
 */

const url = () => process.env.JEBI_ORDER_SHEET_URL || '';
const secret = () => process.env.JEBI_ORDER_SHEET_SECRET || '';
export const orderSheetEnabled = () => Boolean(url() && secret());

async function post(body: Record<string, unknown>, label: string) {
  if (!orderSheetEnabled()) return;
  try {
    const r = await fetch(url(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: secret(), ...body }),
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    const text = await r.text();
    if (!r.ok || !text.includes('"ok":true')) throw new Error(`${r.status}: ${text.slice(0, 200)}`);
  } catch (e) {
    console.error(`JEBI order sheet ${label} failed`, e);
  }
}

/** Columns, in order, matching the sheet's header row. */
export function orderRow(o: OrderEmailData, date = new Date()) {
  return [
    o.ref,
    date.toLocaleString('en-US', { timeZone: 'America/New_York' }),
    o.kind === 'claim' ? 'Sponsor claim' : 'Purchase',
    o.kind === 'claim' ? 'claimed' : 'pending',
    o.item,
    o.tier,
    o.option ?? '',
    o.color ?? '',
    o.size ?? '',
    o.qty,
    o.kind === 'claim' ? 0 : o.total,
    o.name,
    o.email,
    o.phone ?? '',
    o.ship.line1,
    o.ship.line2 ?? '',
    o.ship.city,
    o.ship.state,
    o.ship.zip,
    o.accessCode ?? '',
  ];
}

export const addOrderToSheet = (o: OrderEmailData) => post({ type: 'order', row: orderRow(o) }, `add ${o.ref}`);
export const setSheetStatus = (ref: string, status: string) => post({ type: 'status', ref, status }, `status ${ref}`);
