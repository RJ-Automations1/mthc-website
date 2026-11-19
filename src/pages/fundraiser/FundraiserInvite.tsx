import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CreditCard, ExternalLink, Heart, Lock, MailOpen } from 'lucide-react';
import { PlayerPhoto } from './FundraiserJoin';
import { Envelope, HeaderBacker, ProgressBar, api, money, useTitle } from './shared';

interface PlayerPage {
  name: string;
  slug: string;
  blurb: string | null;
  goal: number;
  number: string | null;
  position: string | null;
  photo: string | null;
  raised: number;
  gifts: number;
  supporters: string[];
}

const AMOUNTS = [25, 50, 100, 250];

/** Public invitation a player sends out: open the envelope, give, and leave a good-luck note. */
export default function FundraiserInvite() {
  const { slug = '' } = useParams();
  const [page, setPage] = useState<PlayerPage | null>(null);
  const [loadError, setLoadError] = useState('');
  const [params] = useSearchParams();
  const fromTeamPage = params.get('open') === '1';
  const [opened, setOpened] = useState(fromTeamPage);

  const [amount, setAmount] = useState<number | null>(50);
  const [custom, setCustom] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState('');
  const [sealing, setSealing] = useState(false);
  const [manualPay, setManualPay] = useState<{ payUrl: string; amount: number; ref: string } | null>(null);

  const first = page?.name.split(/\s+/)[0] ?? '';
  useTitle(page ? `Support ${page.name}` : 'Fundraiser');

  useEffect(() => {
    api<PlayerPage>(`/api/fundraiser/p/${encodeURIComponent(slug)}`).then(setPage).catch((e) => setLoadError(e.message));
  }, [slug]);

  const total = amount ?? Math.round(Number(custom));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!(total >= 5)) return setError('Choose an amount of at least $5.');
    setSealing(true);
    try {
      const r = await api<{ ref: string; payUrl: string; exactAmount: boolean; amount: number }>(
        `/api/fundraiser/p/${encodeURIComponent(slug)}/give`,
        { method: 'POST', json: { amount: total, name, email, note, anonymous } },
      );
      // Let the envelope seal before heading to Square
      await new Promise((res) => setTimeout(res, 900));
      if (r.exactAmount) window.location.href = r.payUrl;
      else setManualPay({ payUrl: r.payUrl, amount: r.amount, ref: r.ref });
    } catch (err: any) {
      setError(err.message);
      setSealing(false);
    }
  }

  if (loadError) {
    return (
      <>
        <HeaderBacker />
        <section className="pt-36 pb-24 text-center px-4">
          <h1 className="section-heading">Link not found</h1>
          <p className="text-gray-600">{loadError}</p>
        </section>
      </>
    );
  }

  return (
    <>
      <HeaderBacker />
      <section className="bg-gradient-to-b from-ink via-maroon-950 to-cream pt-28 pb-10 md:pt-32">
        <div className="max-w-md mx-auto px-4 text-center">
          {page && (
            <div className="mb-4 flex flex-col items-center">
              <PlayerPhoto name={page.name} photo={page.photo} className="w-24 h-24 rounded-full ring-4 ring-gold text-3xl" />
              {(page.number || page.position) && (
                <p className="mt-2 text-sm text-white/70">
                  {[page.number && `#${page.number}`, page.position, 'Morehouse Baseball'].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          )}
          {fromTeamPage && (
            <Link to="/fundraiser" className="mb-5 block text-sm text-white/70 hover:text-gold">← Pick a different player</Link>
          )}
          <p className="eyebrow text-gold">{fromTeamPage ? 'Give & leave a note' : 'You’re invited'}</p>
          <h1 className="mt-2 font-display uppercase font-bold text-white text-4xl md:text-5xl leading-[0.95]">
            {page ? <>{page.name} needs your support</> : 'Loading…'}
          </h1>
          <div className={fromTeamPage ? 'hidden' : 'mt-8'}>
            <button
              type="button"
              onClick={() => setOpened(true)}
              className="block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xl"
              aria-label="Open the invitation"
              disabled={!page}
            >
              <Envelope
                open={opened}
                label={!opened && <span className="font-display uppercase tracking-[0.2em] text-gold-light text-sm">Tap to open</span>}
              >
                <span className="block font-display uppercase text-maroon text-lg leading-tight">Maroon Tiger Homerun Club</span>
                <span className="block text-xs text-gray-600 mt-1">
                  {first} invites you to support Morehouse Baseball — and send a good-luck note.
                </span>
              </Envelope>
            </button>
          </div>
        </div>
      </section>

      {opened && page && (
        <section className="bg-cream pb-20 animate-fade-up">
          <div className="max-w-xl mx-auto px-4 space-y-6">
            <div className="card hover:translate-y-0 p-6">
              {page.blurb && <p className="text-gray-700 italic mb-5">“{page.blurb}” — {first}</p>}
              <ProgressBar raised={page.raised} goal={page.goal} />
              {page.supporters.length > 0 && (
                <p className="mt-4 text-sm text-gray-600">
                  <Heart className="inline w-4 h-4 text-maroon -mt-0.5 mr-1" aria-hidden="true" />
                  {page.gifts} supporter{page.gifts === 1 ? '' : 's'} so far: {page.supporters.join(', ')}
                  {page.gifts > page.supporters.length ? ' and more' : ''}
                </p>
              )}
            </div>

            {manualPay ? (
              <div className="card hover:translate-y-0 p-6 text-center">
                <Envelope open={false} className="max-w-[220px] mx-auto" />
                <h2 className="mt-6 font-display uppercase text-3xl font-bold text-ink">Your note is sealed</h2>
                <p className="mt-2 text-gray-600">
                  Finish your <strong>{money(manualPay.amount)}</strong> gift on the MTHC Square page. Enter{' '}
                  <strong>{money(manualPay.amount)}</strong> and put <strong>{manualPay.ref}</strong> in the note so we can match it.
                  {' '}{first} gets your envelope as soon as the club confirms your payment.
                </p>
                <a href={manualPay.payUrl} className="btn-primary mt-6 uppercase tracking-wider text-sm">
                  <CreditCard className="w-4 h-4" /> Pay on Square <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <form onSubmit={submit} className="card hover:translate-y-0 p-6 space-y-5">
                <h2 className="font-display uppercase text-3xl font-bold text-ink leading-none">Give to {first}</h2>

                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-2">Amount</legend>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {AMOUNTS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAmount(a)}
                        className={`rounded-xl border-2 py-3 font-bold transition ${amount === a ? 'border-maroon bg-maroon text-white' : 'border-gray-200 bg-white text-ink hover:border-maroon'}`}
                        aria-pressed={amount === a}
                      >
                        {money(a)}
                      </button>
                    ))}
                    <label className={`col-span-2 sm:col-span-1 flex items-center rounded-xl border-2 px-3 ${amount === null ? 'border-maroon' : 'border-gray-200'} bg-white`}>
                      <span className="text-gray-500">$</span>
                      <input
                        inputMode="numeric"
                        placeholder="Other"
                        value={custom}
                        onFocus={() => setAmount(null)}
                        onChange={(e) => {
                          setAmount(null);
                          setCustom(e.target.value.replace(/[^\d]/g, '').slice(0, 5));
                        }}
                        className="w-full py-3 pl-1 bg-transparent focus:outline-none font-bold"
                        aria-label="Other amount in dollars"
                      />
                    </label>
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                    Your good-luck note to {first} <span className="text-gray-400">(goes in the envelope)</span>
                  </label>
                  <textarea
                    id="note"
                    rows={4}
                    maxLength={600}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={`Good luck this season, ${first}! Proud of you.`}
                    className="input resize-none"
                  />
                  <p className="text-xs text-gray-400 text-right">{note.length}/600</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dn" className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
                    <input id="dn" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} className="input" autoComplete="name" />
                  </div>
                  <div>
                    <label htmlFor="de" className="block text-sm font-medium text-gray-700 mb-1">Email (for your receipt)</label>
                    <input id="de" required type="email" maxLength={200} value={email} onChange={(e) => setEmail(e.target.value)} className="input" autoComplete="email" />
                  </div>
                </div>

                <label className="flex items-start gap-2 text-sm text-gray-600">
                  <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="mt-0.5 w-4 h-4" />
                  Keep my name a secret — sign the envelope “A secret supporter”
                </label>

                {error && <p className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</p>}

                <button type="submit" disabled={sealing} className="btn-primary w-full uppercase tracking-wider disabled:opacity-60">
                  <MailOpen className="w-4 h-4" />
                  {sealing ? 'Sealing your envelope…' : `Seal & give ${total >= 5 ? money(total) : ''}`}
                </button>
                <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> Secure payment by Square. Your note is delivered to {first} once your gift goes through.
                </p>
              </form>
            )}
          </div>
        </section>
      )}
    </>
  );
}
