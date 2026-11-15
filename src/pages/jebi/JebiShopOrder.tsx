import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BadgeCheck, Clock, CreditCard, ExternalLink } from 'lucide-react';
import usePageTitle from './usePageTitle';
import { jebiPath } from '../../lib/siteMode';
import { JEBI } from './data';
import { money } from './shopShared';

interface PaymentState {
  ref: string;
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled';
  paid: boolean;
  total: number;
  qty: number;
  itemId: string;
  payUrl: string | null;
}

/** Where Square sends buyers after checkout: confirms payment for their order. */
export default function JebiShopOrder() {
  const { ref = '' } = useParams();
  usePageTitle('Your order');
  const [state, setState] = useState<PaymentState | null>(null);
  const [error, setError] = useState('');
  const [checks, setChecks] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/jebi/shop/orders/${encodeURIComponent(ref)}/payment`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.message || 'Order not found.');
        return d as PaymentState;
      })
      .then((d) => !cancelled && setState(d))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [ref, checks]);

  // Square can take a few seconds to record the payment — check again a few times
  useEffect(() => {
    if (state && !state.paid && state.status === 'pending' && checks < 5) {
      const t = setTimeout(() => setChecks((c) => c + 1), 3000);
      return () => clearTimeout(t);
    }
  }, [state, checks]);

  return (
    <>
      <div className="fixed inset-x-0 top-0 h-20 bg-ink z-40" aria-hidden="true" />
      <section className="bg-cream pt-32 pb-20 min-h-[70vh]">
        <div className="max-w-xl mx-auto px-4">
          <div className="card hover:translate-y-0 overflow-hidden text-center">
            <div className="bg-gradient-to-br from-ink via-jebi-dark to-jebi py-6">
              <img src={JEBI.logo} alt="Jay Edwards Baseball Invitational" className="mx-auto h-20 w-auto" />
            </div>
            <div className="p-8" aria-live="polite">
              {error && (
                <>
                  <h1 className="font-display uppercase text-3xl font-bold text-ink">Order not found</h1>
                  <p className="mt-2 text-gray-600">{error}</p>
                </>
              )}
              {!error && !state && <p className="text-gray-500">Checking your payment…</p>}
              {state?.paid && (
                <>
                  <BadgeCheck className="w-14 h-14 text-jebi mx-auto" aria-hidden="true" />
                  <h1 className="mt-3 font-display uppercase text-4xl font-bold text-ink leading-none">Thank you!</h1>
                  <p className="mt-3 text-gray-600">
                    Your <strong>{money(state.total)}</strong> payment for order <strong className="text-ink">{state.ref}</strong> was received.
                    Square has emailed your receipt. Thank you for supporting the Jay Edwards Baseball Invitational and Morehouse Baseball.
                  </p>
                </>
              )}
              {state && !state.paid && state.status === 'pending' && (
                <>
                  <Clock className="w-12 h-12 text-amber-500 mx-auto" aria-hidden="true" />
                  <h1 className="mt-3 font-display uppercase text-3xl font-bold text-ink leading-none">
                    {checks < 5 ? 'Confirming your payment…' : 'Payment not received yet'}
                  </h1>
                  <p className="mt-3 text-gray-600">
                    Order <strong className="text-ink">{state.ref}</strong> · {money(state.total)}. If you closed the Square page before paying, you can finish now.
                  </p>
                  {state.payUrl && (
                    <a href={state.payUrl} className="btn-primary mt-6 uppercase tracking-wider text-sm">
                      <CreditCard className="w-4 h-4" /> Pay {money(state.total)} on Square <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </>
              )}
              {state?.status === 'cancelled' && (
                <>
                  <h1 className="font-display uppercase text-3xl font-bold text-ink">Order cancelled</h1>
                  <p className="mt-2 text-gray-600">Order {state.ref} was cancelled. Please place a new order from the shop.</p>
                </>
              )}
              <Link to={jebiPath('/shop')} className="btn-secondary mt-8 uppercase tracking-wider text-sm">
                Back to the shop
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
