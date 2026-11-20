import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { HeaderBacker, api, useTitle } from './shared';

/** Opt-out link at the bottom of every fundraiser email. */
export default function FundraiserStop() {
  const { ref = '' } = useParams();
  useTitle('Stop fundraiser messages');
  const [state, setState] = useState<'ask' | 'done' | 'error'>('ask');
  const [busy, setBusy] = useState(false);

  async function stop() {
    setBusy(true);
    try {
      await api(`/api/fundraiser/stop/${encodeURIComponent(ref)}`, { method: 'POST' });
      setState('done');
    } catch {
      setState('error');
    }
  }

  return (
    <>
      <HeaderBacker />
      <section className="bg-cream pt-36 pb-24 px-4 min-h-[60vh]">
        <div className="max-w-md mx-auto card hover:translate-y-0 p-8 text-center">
          {state === 'ask' && (
            <>
              <h1 className="font-display uppercase text-3xl font-bold text-ink">Stop these messages?</h1>
              <p className="mt-3 text-gray-600">You won’t get any more fundraiser invitations or reminders from this player.</p>
              <button type="button" onClick={stop} disabled={busy} className="btn-primary mt-6 disabled:opacity-60">
                {busy ? 'One moment…' : 'Yes, stop them'}
              </button>
            </>
          )}
          {state === 'done' && (
            <>
              <h1 className="font-display uppercase text-3xl font-bold text-ink">You’re all set</h1>
              <p className="mt-3 text-gray-600">You won’t hear from us about this fundraiser again. Thank you for your time.</p>
            </>
          )}
          {state === 'error' && <p className="text-gray-600">We couldn’t find that link. Reply to the email and we’ll take you off the list.</p>}
        </div>
      </section>
    </>
  );
}
