import type { ReactNode } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { ExternalLink, Radio, BarChart3, CalendarDays, CalendarPlus, MapPin } from 'lucide-react';
import { JEBI, JEBI_NAV, TEAMS, googleCalendarUrl, type Game, type Team } from './data';
import type { Photo } from '../../lib/photos';
import { IS_JEBI_SITE, isExternalUrl as isExternal, jebiPath } from '../../lib/siteMode';

/** A link that degrades to non-clickable "Coming soon" text when its URL is still pending. */
export function MaybeLink({
  href,
  children,
  className = '',
  pendingClassName = '',
  pendingLabel = 'Coming soon',
}: {
  href: string | null | undefined;
  children: ReactNode;
  className?: string;
  pendingClassName?: string;
  pendingLabel?: string;
}) {
  if (!href) {
    return (
      <span className={pendingClassName || className} aria-disabled="true" title="Link coming soon">
        {children}
        <span className="sr-only"> — </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{pendingLabel}</span>
      </span>
    );
  }
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
        <ExternalLink className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }
  if (href.startsWith('mailto:') || href.startsWith('tel:') || href.endsWith('.pdf')) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
}

/** Wraps every /jebi page with the event's own sub-navigation. */
export function JebiLayout() {
  return (
    <>
      <Outlet />
      <JebiFooterBand />
    </>
  );
}

/** Sticky event sub-nav shown under each JEBI page hero. */
export function JebiSubNav() {
  // On the standalone JEBI site these links live in the main header instead.
  if (IS_JEBI_SITE) return null;
  return (
    <nav aria-label="Jay Edwards Baseball Invitational" className="sticky top-20 z-40 bg-white/95 backdrop-blur border-b border-black/5 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4">
        <Link to={jebiPath()} className="hidden md:flex items-center gap-2 py-2 shrink-0" aria-label="JEBI home">
          <img src={JEBI.logo} alt="" className="h-9 w-auto" />
        </Link>
        <ul className="flex gap-1 overflow-x-auto no-scrollbar py-2 -mx-1 px-1">
          {JEBI_NAV.map((item) => (
            <li key={item.href} className="shrink-0">
              <NavLink
                to={item.href}
                end={item.href === jebiPath()}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                    isActive ? 'bg-jebi text-white' : 'text-ink/70 hover:text-jebi hover:bg-jebi/5'
                  }`
                }
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

/**
 * Shading over hero photos. Dark only where text sits (left side, top under the
 * nav, bottom edge) so the rest of the photo shows at full brightness. Phones get
 * a little more overall shade because the text spans the full width there.
 */
export function HeroScrim() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-ink/45 md:bg-ink/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/45 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/70 to-transparent" />
    </div>
  );
}

/** Event hero — same treatment as the site's PageHero, with the JEBI sub-nav attached. */
export function JebiHero({
  eyebrow,
  title,
  subtitle,
  image,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  image: Photo;
  children?: ReactNode;
}) {
  return (
    <>
      <section
        className={`relative isolate overflow-hidden bg-ink pt-32 pb-14 md:pt-40 md:pb-20 ${
          // Tall photos get a taller banner so more of the photo shows; text sits
          // low so faces near the top stay clear.
          image.tall ? 'md:min-h-[720px] md:flex md:flex-col md:justify-end md:pb-16' : ''
        }`}
      >
        <img
          src={image.src}
          style={{ objectPosition: image.position }}
          alt=""
          className={`absolute inset-0 -z-10 h-full w-full object-cover contrast-[1.05] saturate-[1.1] ${
            image.tall ? '' : 'animate-slow-zoom'
          }`}
        />
        <HeroScrim />
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-up [text-shadow:0_2px_14px_rgba(0,0,0,0.55)]">
          <span className="eyebrow text-gold">{eyebrow}</span>
          <h1 className="mt-4 font-display uppercase font-bold text-white text-5xl md:text-7xl leading-[0.9]">
            {title}
          </h1>
          {subtitle && <p className="mt-5 max-w-2xl text-lg md:text-xl text-white/90">{subtitle}</p>}
          <EventMeta className="mt-6" />
          {children && <div className="mt-8">{children}</div>}
        </div>
        <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-jebi via-gold to-jebi" />
      </section>
      <JebiSubNav />
    </>
  );
}

export function EventMeta({ className = '', dark = true }: { className?: string; dark?: boolean }) {
  const tone = dark ? 'text-white/80' : 'text-ink/70';
  return (
    <ul className={`flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold uppercase tracking-wider ${tone} ${className}`}>
      <li className="flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-gold" aria-hidden="true" /> {JEBI.dates}
      </li>
      <li className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-gold" aria-hidden="true" /> {JEBI.venue} · {JEBI.city}
      </li>
    </ul>
  );
}

export function SectionHeader({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="max-w-3xl mb-10">
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="section-heading mt-3">{title}</h2>
      {children && <div className="text-lg text-gray-600 leading-relaxed">{children}</div>}
    </div>
  );
}

export function TeamBadge({ team, size = 'md' }: { team: Team; size?: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: 'w-14 h-11 text-xs', md: 'w-20 h-16 text-base', lg: 'w-28 h-24 text-lg' }[size];
  const pad = { sm: 'p-1', md: 'p-2', lg: 'p-3' }[size];
  if (team.logo) {
    // Rounded white tile (not a circle) so wide wordmarks like Dillard and
    // Savannah State stay readable at small sizes.
    return (
      <div className={`${dims} ${pad} rounded-xl bg-white ring-1 ring-black/10 shadow-sm flex items-center justify-center shrink-0`}>
        <img src={team.logo} alt={`${team.school} logo`} className="h-full w-full object-contain" />
      </div>
    );
  }
  const initials = team.name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2);
  return (
    <div
      className={`${dims} rounded-full bg-jebi text-white font-display font-bold flex items-center justify-center shrink-0 ring-2 ring-gold/60`}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

export const teamByName = (name: string) => TEAMS.find((t) => t.name === name);

const STATUS_STYLE: Record<Game['status'], { label: string; cls: string }> = {
  scheduled: { label: 'Scheduled', cls: 'bg-gray-100 text-gray-600' },
  live: { label: 'Live', cls: 'bg-red-600 text-white animate-pulse' },
  final: { label: 'Final', cls: 'bg-ink text-white' },
  postponed: { label: 'Postponed', cls: 'bg-amber-100 text-amber-800' },
  canceled: { label: 'Canceled', cls: 'bg-amber-100 text-amber-800' },
};

export function GameCard({ game, dayLabel }: { game: Game; dayLabel?: string }) {
  const a = teamByName(game.away);
  const b = teamByName(game.home);
  const status = STATUS_STYLE[game.status];
  const btn =
    'inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition';
  const live = game.status === 'live';
  return (
    <article className="card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-display text-2xl font-bold text-jebi leading-none">
          {game.time} <span className="text-sm text-gray-400 font-body font-semibold">ET</span>
        </span>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${status.cls}`}>{status.label}</span>
      </div>
      {dayLabel && <p className="-mt-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{dayLabel}</p>}
      <div className="flex flex-col gap-2">
        {[{ name: game.away, team: a, score: game.score?.away }, { name: game.home, team: b, score: game.score?.home }].map(
          (side, i) => (
            <div key={side.name} className="flex items-center gap-3">
              {side.team && <TeamBadge team={side.team} size="sm" />}
              <span className="font-display uppercase text-xl font-bold text-ink flex-1">{side.name}</span>
              {game.status === 'final' && side.score !== undefined && (
                <span className="font-display text-2xl font-bold">{side.score}</span>
              )}
              {i === 0 && game.status !== 'final' && <span className="text-xs font-bold text-gray-400">VS</span>}
            </div>
          ),
        )}
      </div>
      {game.notice && <p className="text-sm bg-amber-50 text-amber-900 rounded-xl px-3 py-2">{game.notice}</p>}
      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        {game.status === 'final' ? (
          <MaybeLink
            href={game.boxScoreUrl}
            className={`${btn} bg-ink text-white hover:bg-jebi`}
            pendingClassName={`${btn} bg-gray-100 text-gray-400 cursor-not-allowed`}
          >
            Box Score
          </MaybeLink>
        ) : (
          <>
            <MaybeLink
              href={game.liveStatsUrl}
              className={`${btn} ${live ? 'bg-jebi text-white hover:bg-jebi-dark' : 'border-2 border-jebi text-jebi hover:bg-jebi hover:text-white'}`}
              pendingClassName={`${btn} bg-gray-100 text-gray-400 cursor-not-allowed gap-2`}
            >
              <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" /> Live Stats
            </MaybeLink>
            <MaybeLink
              href={game.watchUrl}
              className={`${btn} ${live ? 'bg-jebi text-white hover:bg-jebi-dark' : 'border-2 border-jebi text-jebi hover:bg-jebi hover:text-white'}`}
              pendingClassName={`${btn} bg-gray-100 text-gray-400 cursor-not-allowed gap-2`}
            >
              <Radio className="w-3.5 h-3.5" aria-hidden="true" /> Watch
            </MaybeLink>
          </>
        )}
      </div>
      {game.status !== 'final' && game.status !== 'canceled' && (
        <div className="-mt-1 pt-3 border-t border-gray-100 flex items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-gray-500 truncate">
            <MapPin className="w-3.5 h-3.5 text-jebi shrink-0" aria-hidden="true" /> {JEBI.venue}
          </span>
          <a
            href={googleCalendarUrl(game)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-jebi hover:underline shrink-0"
          >
            <CalendarPlus className="w-3.5 h-3.5" aria-hidden="true" /> Add to calendar
            <span className="sr-only">(opens Google Calendar in a new tab)</span>
          </a>
        </div>
      )}
    </article>
  );
}

/** Photo grid — first photo large on desktop, the rest in a tidy mosaic. */
export function PhotoGallery({ photos }: { photos: { src: string; position?: string; alt: string }[] }) {
  return (
    <ul className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-3 md:h-[560px]">
      {photos.slice(0, 5).map((p, i) => (
        <li
          key={p.src}
          className={`overflow-hidden rounded-2xl bg-ink ring-1 ring-black/5 ${
            i === 0 ? 'col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto' : 'aspect-square md:aspect-auto'
          }`}
        >
          <img
            src={p.src}
            alt={p.alt}
            loading="lazy"
            style={{ objectPosition: p.position }}
            className="h-full w-full object-cover hover:scale-[1.04] transition-transform duration-500"
          />
        </li>
      ))}
    </ul>
  );
}

/** Closing call-to-action band shown at the bottom of every JEBI page. */
function JebiFooterBand() {
  return (
    <section className="bg-jebi-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row lg:items-center gap-8">
        <img src={JEBI.logo} alt="Jay Edwards Baseball Invitational logo" className="h-24 w-auto self-start" />
        <div className="flex-1">
          <h2 className="font-display uppercase text-3xl md:text-4xl font-bold leading-none">
            {JEBI.edition} {JEBI.name}
          </h2>
          <EventMeta className="mt-3" />
          <p className="mt-3 text-sm text-white/60">
            Presented by the Maroon Tiger Homerun Club, Inc. · Media operations by Perez Sports Group, LLC
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to={jebiPath('/schedule')} className="btn-ghost-light uppercase tracking-wider text-sm">
            Schedule
          </Link>
          <Link to={jebiPath('/partnerships')} className="btn-gold uppercase tracking-wider text-sm">
            Become a Partner
          </Link>
        </div>
      </div>
    </section>
  );
}
