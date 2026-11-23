import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Clock, CreditCard, ExternalLink } from 'lucide-react';
import { Envelope, HeaderBacker, api, money, useTitle } from './shared';

interface GiftState {
  ref: string;
  status: 'pending' | 'paid' | 'cancelled';
  paid: boolean;
  amount: number;
  payUrl: string | null;
}

/** Where Square sends donors after checkout: confirms payment and "delivers" the envelope. */
export default function FundraiserThanks() {
  const { slug = '', ref = '' } = useParams();
  useTitle('Thank you');
  const [state, setState] = useState<GiftState | null>(null);
  const [error, setError] = useState('');
  const [checks, setChecks] = useState(0);

  useEffect(() => {
    api<GiftState>(`/api/fundraiser/gifts/${encodeURIComponent(ref)}`).then(setState).catch((e) => setError(e.message));
  }, [ref, checks]);

  // Square can take a few seconds to record the payment
  useEffect(() => {
    if (state && !state.paid && state.status === 'pending' && checks < 5) {
      const t = setTimeout(() => setChecks((c) => c + 1), 3000);
      return () => clearTimeout(t);
    }
  }, [state, checks]);

  return (
    <>
      <HeaderBacker />
      <section className="bg-cream pt-32 pb-20 min-h-[70vh]">
        <div className="max-w-md mx-auto px-4 text-center" aria-live="polite">
          {error && (
            <>
              <h1 className="section-heading">Gift not found</h1>
              <p className="text-gray-600">{error}</p>
            </>
          )}
          {!error && !state && <p className="text-gray-500">Checking your gift…</p>}

          {state?.paid && (
            <>
              <div className="max-w-[260px] mx-auto animate-fade-up">
                <Envelope label={<span className="font-display uppercase tracking-[0.2em] text-gold-light text-xs">Delivered</span>} />
              </div>
              <h1 className="mt-8 font-display uppercase text-5xl font-bold text-ink leading-none">Thank you!</h1>
              <p className="mt-3 text-gray-600">
                Your <strong>{money(state.amount)}</strong> gift was received and your envelope is on its way to their inbox.
                Square has emailed your receipt. Thank you for supporting Morehouse Baseball.
              </p>
            </>
          )}

          {state && !state.paid && state.status === 'pending' && (
            <>
              <Clock className="w-12 h-12 text-amber-500 mx-auto" aria-hidden="true" />
              <h1 className="mt-3 font-display uppercase text-3xl font-bold text-ink leading-none">
                {checks < 5 ? 'Confirming your gift…' : 'Payment not received yet'}
              </h1>
              <p className="mt-3 text-gray-600">
                Your envelope is sealed and waiting. If you closed the Square page before paying, you can finish now.
              </p>
              {state.payUrl && (
                <a href={state.payUrl} className="btn-primary mt-6 uppercase tracking-wider text-sm">
                  <CreditCard className="w-4 h-4" /> Pay {money(state.amount)} on Square <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </>
          )}

          {state?.status === 'cancelled' && (
            <>
              <h1 className="section-heading">Gift cancelled</h1>
              <p className="text-gray-600">This gift was cancelled. You can start a new one below.</p>
            </>
          )}

          <Link to={`/fundraiser/${slug}`} className="btn-secondary mt-8 uppercase tracking-wider text-sm">
            Back to the fundraiser
          </Link>
        </div>
      </section>
    </>
  );
}
