import crypto from 'crypto';
import { Client, Environment } from 'square';

/**
 * Square Checkout for JEBI shop orders.
 *
 * With SQUARE_ACCESS_TOKEN + SQUARE_LOCATION_ID set (MTHC's Square account),
 * every purchase gets its own Square checkout page pre-filled with the exact
 * item and amount, and the site can confirm payment with Square afterwards.
 * Without them, the shop falls back to MTHC's static Square link.
 */

const token = () => process.env.SQUARE_ACCESS_TOKEN || '';
const locationId = () => process.env.SQUARE_LOCATION_ID || '';

export const squareEnabled = () => Boolean(token() && locationId());

let client: Client | null = null;
function square() {
  if (!client) {
    client = new Client({
      accessToken: token(),
      environment: process.env.SQUARE_ENVIRONMENT === 'sandbox' ? Environment.Sandbox : Environment.Production,
    });
  }
  return client;
}

/** Creates a one-off Square checkout page for an order. Returns its URL and Square order id. */
export async function createCheckout(order: {
  ref: string;
  title: string; // e.g. "JEBI Hoodies — Embroidered (left chest) × 2"
  totalDollars: number;
  email?: string;
  returnUrl: string;
}) {
  const { result } = await square().checkoutApi.createPaymentLink({
    idempotencyKey: crypto.randomUUID(),
    quickPay: {
      name: order.title.slice(0, 255),
      priceMoney: { amount: BigInt(Math.round(order.totalDollars * 100)), currency: 'USD' },
      locationId: locationId(),
    },
    checkoutOptions: { redirectUrl: order.returnUrl, askForShippingAddress: false },
    prePopulatedData: order.email ? { buyerEmail: order.email } : undefined,
    paymentNote: `JEBI shop order ${order.ref}`,
  });
  const link = result.paymentLink;
  if (!link?.url) throw new Error('Square did not return a checkout URL');
  return { url: link.url, squareOrderId: link.orderId ?? null };
}

/** True once Square shows the order fully paid. */
export async function isPaid(squareOrderId: string, totalDollars: number) {
  const { result } = await square().ordersApi.retrieveOrder(squareOrderId);
  const o = result.order;
  if (!o) return false;
  if (o.state === 'COMPLETED') return true;
  const paid = (o.tenders ?? []).reduce((sum, t) => sum + Number(t.amountMoney?.amount ?? 0n), 0);
  return paid >= Math.round(totalDollars * 100);
}
