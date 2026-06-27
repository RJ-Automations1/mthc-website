/**
 * Square Web Payments SDK Integration
 * 
 * This module handles the client-side Square payment form initialization.
 * In production, load the Square Web Payments SDK and initialize the card form.
 * 
 * Documentation: https://developer.squareup.com/docs/web-payments/overview
 */

declare global {
  interface Window {
    Square: any;
  }
}

// Square Application ID (set in environment)
const SQUARE_APP_ID = import.meta.env.VITE_SQUARE_APP_ID || '';
const SQUARE_LOCATION_ID = import.meta.env.VITE_SQUARE_LOCATION_ID || '';

export async function initializeSquarePayments() {
  if (!window.Square) {
    throw new Error('Square Web Payments SDK not loaded');
  }

  const payments = window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID);
  return payments;
}

export async function createCardPayment(payments: any, containerId: string) {
  const card = await payments.card();
  await card.attach(`#${containerId}`);
  return card;
}

export async function tokenizeCard(card: any): Promise<string> {
  const result = await card.tokenize();
  if (result.status === 'OK') {
    return result.token;
  }
  throw new Error(result.errors?.[0]?.message || 'Card tokenization failed');
}

/**
 * Usage in Donate page:
 * 
 * 1. Add Square SDK script to index.html:
 *    <script src="https://sandbox.web.squarecdn.com/v1/square.js"></script>
 *    (Use https://web.squarecdn.com/v1/square.js for production)
 * 
 * 2. Initialize in component:
 *    const payments = await initializeSquarePayments();
 *    const card = await createCardPayment(payments, 'square-card-container');
 * 
 * 3. On form submit:
 *    const sourceId = await tokenizeCard(card);
 *    // Send sourceId to backend /api/donate endpoint
 */
