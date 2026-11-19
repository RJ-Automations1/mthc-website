import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PHOTOS } from '../../lib/photos';
import { Envelope, HeaderBacker, api, money, useTitle } from './shared';

interface RosterPlayer {
  slug: string;
  name: string;
  number: string | null;
  position: string | null;
  class_year: string | null;
  photo: string | null;
  goal: number;
  raised: number;
  gifts: number;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w) && !/^(Jr|Sr|II|III|IV)\.?$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

export function PlayerPhoto({ name, photo, className = '' }: { name: string; photo: string | null; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!photo || failed) {
    return (
      <div className={`grid place-items-center bg-maroon text-gold font-display font-bold ${className}`} aria-hidden="true">
        {initials(name)}
      </div>
    );
  }
  return <img src={photo} alt="" loading="lazy" onError={() => setFailed(true)} className={`object-cover object-top bg-gray-100 ${className}`} />;
}

/**
 * The fundraiser link donors get: a sealed invitation that opens onto the team.
 * Donors pick a player, give, and leave that player a good-luck note.
 */
export default function FundraiserJoin() {
  useTitle('Team Fundraiser');
  const [players, setPlayers] = useState<RosterPlayer[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [opening, setOpening] = useState(false);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    api<{ players: RosterPlayer[] }>('/api/fundraiser/roster')
      .then((d) => setPlayers(d.players))
      .catch((e) => setLoadError(e.message));
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (players ?? []).filter((p) => !q || p.name.toLowerCase().includes(q) || p.number === q);
  }, [players, query]);
  const teamRaised = (players ?? []).reduce((s, p) => s + p.raised, 0);
  const teamGifts = (players ?? []).reduce((s, p) => s + p.gifts, 0);

  function openInvite() {
    if (opening) return;
    setOpening(true);
    setTimeout(() => {
      setOpened(true);
      window.scrollTo({ top: 0 });
    }, 1300);
  }

  // ── The sealed invitation ──────────────────────────────────────────────────
  if (!opened) {
    return (
      <>
        <HeaderBacker />
        <section className="relative isolate overflow-hidden bg-ink min-h-[100svh] pt-28 pb-16 flex items-center">
          <img src={PHOTOS.fundraiserHero.src} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25 blur-[2px]" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/80 via-maroon-950/80 to-ink" />
          <div className="w-full max-w-lg mx-auto px-4 text-center">
            <p className="eyebrow text-gold">You’re invited</p>
            <h1 className="mt-3 font-display uppercase font-bold text-white text-4xl md:text-6xl leading-[0.9]">
              Welcome to the Maroon Tiger Fundraiser
            </h1>
            <p className="mt-4 text-white/70">Morehouse College Baseball · Maroon Tiger Homerun Club</p>
            <button
              type="button"
              onClick={openInvite}
              className="mt-10 block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xl"
              aria-label="Open the invitation"
            >
              <Envelope
                open={opening}
                label={!opening && <span className="font-display uppercase tracking-[0.25em] text-gold-light text-sm">Tap to open</span>}
              >
                <span className="block font-display uppercase text-maroon text-lg leading-tight">You’re invited to support the team</span>
                <img src={PHOTOS.fundraiserHero.src} alt="" className="mt-2 w-full h-16 sm:h-20 object-cover rounded" />
              </Envelope>
            </button>
          </div>
        </section>
      </>
    );
  }

  // ── Opened: the team ───────────────────────────────────────────────────────
  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink pt-28 pb-12 md:pt-36 md:pb-16 animate-fade-up">
        <img
          src={PHOTOS.fundraiserHero.src}
          style={{ objectPosition: PHOTOS.fundraiserHero.position }}
          alt="The Morehouse College baseball team"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/50 to-maroon-900/30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="eyebrow text-gold">Welcome</span>
          <h1 className="mt-3 font-display uppercase font-bold text-white text-5xl md:text-7xl leading-[0.9]">
            Meet the <span className="text-gold">Maroon Tigers</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Pick a player, give in their name, and leave them a good-luck note. Every dollar goes to Morehouse Baseball, and
            your note is delivered to that player in a sealed envelope.
          </p>
          {players && (
            <p className="mt-6 text-white/80">
              <span className="font-display text-4xl font-bold text-gold">{money(teamRaised)}</span> raised
              {teamGifts > 0 && <> from {teamGifts} supporter{teamGifts === 1 ? '' : 's'}</>}
            </p>
          )}
        </div>
        <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-maroon via-gold to-maroon" />
      </section>

      <section className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="section-heading !mb-1">Who are you supporting?</h2>
            <p className="text-gray-600">Tap a player to give and write your note.</p>
          </div>
          <label className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a player or number" className="input !pl-9" aria-label="Find a player" />
          </label>
        </div>

        {loadError && <p className="text-gray-600">{loadError}</p>}
        {!players && !loadError && <p className="text-gray-500">Loading the team…</p>}

        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {shown.map((p) => {
            const pct = p.goal ? Math.min(100, Math.round((p.raised / p.goal) * 100)) : 0;
            return (
              <li key={p.slug}>
                <Link to={`/fundraiser/${p.slug}?open=1`} className="card block h-full">
                  <PlayerPhoto name={p.name} photo={p.photo} className="w-full aspect-[4/5] text-4xl" />
                  <div className="p-3">
                    <p className="font-display uppercase font-bold text-ink text-lg leading-tight">
                      {p.number && <span className="text-maroon">#{p.number} </span>}
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-500">{[p.position, p.class_year].filter(Boolean).join(' · ')}</p>
                    <div className="mt-2 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-maroon to-gold" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-gray-600">{money(p.raised)} raised</p>
                    <span className="mt-2 inline-block text-xs font-semibold text-maroon">Give & leave a note →</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        {players && shown.length === 0 && <p className="text-gray-600">No player matches “{query}”.</p>}
      </section>
    </>
  );
}
