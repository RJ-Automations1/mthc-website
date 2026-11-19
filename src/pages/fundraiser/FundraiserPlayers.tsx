import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Search } from 'lucide-react';
import { PlayerPhoto } from './FundraiserJoin';
import { HeaderBacker, api, useTitle } from './shared';

interface P {
  slug: string;
  name: string;
  number: string | null;
  photo: string | null;
}

export const PORTAL_KEY_STORE = 'mthc-fundraiser-key:';

/** The link sent to every player: pick your name, set/enter your PIN, land in your portal. */
export default function FundraiserPlayers() {
  useTitle('Player portal');
  const navigate = useNavigate();
  const [players, setPlayers] = useState<P[] | null>(null);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<P | null>(null);
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ players: P[] }>('/api/fundraiser/players').then((d) => setPlayers(d.players)).catch((e) => setError(e.message));
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (players ?? []).filter((p) => !q || p.name.toLowerCase().includes(q) || p.number === q);
  }, [players, query]);

  async function pick(p: P) {
    setPicked(p);
    setError('');
    setPin('');
    setPin2('');
    setHasPin(null);
    try {
      const r = await api<{ hasPin: boolean }>('/api/fundraiser/players/status', { method: 'POST', json: { slug: p.slug } });
      setHasPin(r.hasPin);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!picked) return;
    setError('');
    if (!/^\d{4,6}$/.test(pin)) return setError('Use 4 to 6 numbers.');
    if (hasPin === false && pin !== pin2) return setError('The two PINs don’t match.');
    setBusy(true);
    try {
      const r = await api<{ slug: string; key: string }>('/api/fundraiser/players/login', { method: 'POST', json: { slug: picked.slug, pin } });
      try {
        localStorage.setItem(PORTAL_KEY_STORE + r.slug, r.key);
        navigate(`/fundraiser/${r.slug}/inbox`);
      } catch {
        navigate(`/fundraiser/${r.slug}/inbox?key=${encodeURIComponent(r.key)}`);
      }
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <>
      <HeaderBacker />
      <section className="bg-cream pt-28 pb-20 md:pt-32 min-h-[80vh]">
        <div className="max-w-4xl mx-auto px-4">
          <p className="eyebrow text-maroon">Maroon Tiger Fundraiser</p>
          <h1 className="mt-1 font-display uppercase font-bold text-ink text-4xl md:text-6xl leading-[0.95]">Player portal</h1>

          {!picked ? (
            <>
              <p className="mt-3 text-gray-600 max-w-2xl">
                Tap your name. In your portal you list the people you want invited — we send them your personal invitation and
                follow up for you — and you open the envelopes your supporters send you.
              </p>
              <label className="relative mt-6 block sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find your name or number" className="input !pl-9" aria-label="Find your name" />
              </label>
              {!players && !error && <p className="mt-6 text-gray-500">Loading the team…</p>}
              {error && <p className="mt-6 text-red-700">{error}</p>}
              <ul className="mt-6 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {shown.map((p) => (
                  <li key={p.slug}>
                    <button type="button" onClick={() => pick(p)} className="card w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon">
                      <PlayerPhoto name={p.name} photo={p.photo} className="w-full aspect-square text-2xl" />
                      <p className="p-2 text-xs font-semibold text-ink leading-tight">
                        {p.number && <span className="text-maroon">#{p.number} </span>}
                        {p.name}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <form onSubmit={submit} className="mt-8 max-w-sm card hover:translate-y-0 p-6 space-y-4">
              <button type="button" onClick={() => setPicked(null)} className="text-sm text-gray-500 hover:text-maroon inline-flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Not you?
              </button>
              <div className="flex items-center gap-3">
                <PlayerPhoto name={picked.name} photo={picked.photo} className="w-14 h-14 rounded-full text-lg" />
                <p className="font-display uppercase font-bold text-2xl text-ink leading-none">{picked.name}</p>
              </div>
              {hasPin === null && !error && <p className="text-gray-500 text-sm">One moment…</p>}
              {hasPin === false && (
                <p className="text-sm text-gray-600">First time here — create a 4–6 number PIN. You’ll use it every time you sign in.</p>
              )}
              {hasPin !== null && (
                <>
                  <div>
                    <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">{hasPin ? 'Your PIN' : 'Create a PIN'}</label>
                    <input id="pin" inputMode="numeric" type="password" autoComplete={hasPin ? 'current-password' : 'new-password'} maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} className="input tracking-[0.5em] text-center text-xl" autoFocus />
                  </div>
                  {!hasPin && (
                    <div>
                      <label htmlFor="pin2" className="block text-sm font-medium text-gray-700 mb-1">Type it again</label>
                      <input id="pin2" inputMode="numeric" type="password" autoComplete="new-password" maxLength={6} value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ''))} className="input tracking-[0.5em] text-center text-xl" />
                    </div>
                  )}
                  <button type="submit" disabled={busy} className="btn-primary w-full uppercase tracking-wider disabled:opacity-60">
                    <Lock className="w-4 h-4" /> {busy ? 'Opening…' : hasPin ? 'Sign in' : 'Create PIN & open my portal'}
                  </button>
                </>
              )}
              {error && <p className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</p>}
              <p className="text-xs text-gray-500">Forgot your PIN? Ask your coach to reset it.</p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
