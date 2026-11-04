import { Link } from 'react-router-dom';
import { ArrowRight, Ticket, HeartHandshake, ShoppingBag, Radio, BarChart3 } from 'lucide-react';
import { JEBI, GAMES, DAYS, TEAMS, SPONSORS } from './data';
import { EventMeta, GameCard, JebiSubNav, MaybeLink, SectionHeader, TeamBadge } from './components';
import { PHOTOS } from '../../lib/photos';
import usePageTitle from './usePageTitle';
import { jebiPath } from '../../lib/siteMode';

export default function JebiHome() {
  usePageTitle('Home');
  const friday = GAMES.filter((g) => g.day === 'fri');

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink pt-32 pb-16 md:pt-36 md:pb-24">
        <img
          src={PHOTOS.jebiHomeHero.src}
          style={{ objectPosition: PHOTOS.jebiHomeHero.position }}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-45 animate-slow-zoom"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/70 to-jebi-dark/70" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-10 items-center animate-fade-up">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <span className="eyebrow text-gold">{JEBI.edition} · Atlanta 2027</span>
            <h1 className="mt-4 font-display uppercase font-bold text-white text-5xl md:text-7xl leading-[0.9]">
              {JEBI.edition} Jay Edwards
              <br />
              <span className="text-gold">Baseball Invitational</span>
            </h1>
            <EventMeta className="mt-6" />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={jebiPath('/schedule')} className="btn-ghost-light uppercase tracking-wider text-sm">
                View Schedule
              </Link>
              <Link to={jebiPath('/tickets')} className="btn-gold uppercase tracking-wider text-sm">
                <Ticket className="w-4 h-4" /> Get Tickets
              </Link>
              <Link to={jebiPath('/partnerships')} className="btn-ghost-light uppercase tracking-wider text-sm">
                Become a Partner
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center">
            <img
              src={JEBI.logo}
              alt="Jay Edwards Baseball Invitational official logo"
              className="w-72 md:w-96 lg:w-full max-w-md drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-jebi via-gold to-jebi" />
      </section>
      <JebiSubNav />

      {/* Intro */}
      <section className="container-page">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <span className="eyebrow">Honoring a legacy</span>
            <p className="mt-4 font-display text-3xl md:text-4xl font-bold text-ink leading-tight">
              Three days. Six collegiate programs. Nine matchups. One celebration of baseball, mentorship, and the
              legacy of Javarro “Jay” Edwards.
            </p>
            <p className="mt-5 text-lg text-gray-600">
              Join us in Atlanta for the inaugural Jay Edwards Baseball Invitational — a first-class tournament that
              celebrates the rich tradition, history, and future of HBCU collegiate baseball.
            </p>
          </div>
          <div className="lg:col-span-5 grid grid-cols-3 gap-3 text-center">
            {[
              ['3', 'Days'],
              ['6', 'Programs'],
              ['9', 'Games'],
            ].map(([n, l]) => (
              <div key={l} className="rounded-2xl bg-jebi text-white py-6">
                <div className="font-display text-5xl font-bold leading-none">{n}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-gold">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming games */}
      <section className="bg-white border-y border-black/5">
        <div className="container-page">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <SectionHeader eyebrow={`Opening day · ${DAYS[0].label}, ${DAYS[0].date}`} title="Upcoming Games" />
            <Link to={jebiPath('/schedule')} className="btn-primary self-start md:mb-10 uppercase tracking-wider text-sm">
              Full Schedule <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {friday.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        </div>
      </section>

      {/* Teams */}
      <section className="container-page">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <SectionHeader eyebrow="The field" title="Six Participating Programs" />
          <Link to={jebiPath('/teams')} className="btn-secondary self-start md:mb-10 uppercase tracking-wider text-sm">
            Meet the Teams <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {TEAMS.map((t) => (
            <li key={t.id}>
              <Link
                to={jebiPath(`/teams#${t.id}`)}
                className="card p-5 flex flex-col items-center text-center gap-3 h-full"
              >
                <TeamBadge team={t} size="lg" />
                <span className="font-display uppercase text-lg font-bold text-ink leading-tight">{t.school}</span>
                <span className="text-xs text-gray-500">{t.location}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Tickets + Media */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-20 grid lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-jebi text-white p-8 md:p-10 flex flex-col">
          <Ticket className="w-10 h-10 text-gold" aria-hidden="true" />
          <h2 className="mt-4 font-display uppercase text-4xl font-bold leading-none">Experience it live</h2>
          <p className="mt-3 text-white/75">
            Single-day and full-event passes for all three days at {JEBI.venue}. Ticket details are being finalized.
          </p>
          <Link to={jebiPath('/tickets')} className="btn-gold mt-6 self-start uppercase tracking-wider text-sm">
            Ticket Info <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="rounded-3xl bg-ink text-white p-8 md:p-10 flex flex-col">
          <Radio className="w-10 h-10 text-gold" aria-hidden="true" />
          <h2 className="mt-4 font-display uppercase text-4xl font-bold leading-none">Watch & follow</h2>
          <p className="mt-3 text-white/75">
            Stream every game and follow live stats all weekend. Coverage led by Perez Sports Group, LLC.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <MaybeLink
              href={JEBI.watchUrl}
              className="btn-ghost-light uppercase tracking-wider text-sm"
              pendingClassName="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white/50"
            >
              <Radio className="w-4 h-4" /> Watch
            </MaybeLink>
            <MaybeLink
              href={JEBI.liveStatsUrl}
              className="btn-ghost-light uppercase tracking-wider text-sm"
              pendingClassName="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white/50"
            >
              <BarChart3 className="w-4 h-4" /> Live Stats
            </MaybeLink>
            <Link to={jebiPath('/media')} className="btn-gold uppercase tracking-wider text-sm">
              Media Hub
            </Link>
          </div>
        </div>
      </section>

      {/* Partnerships + Shop */}
      <section className="bg-white border-y border-black/5">
        <div className="container-page grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <HeartHandshake className="w-10 h-10 text-jebi" aria-hidden="true" />
            <SectionHeader eyebrow="Partnerships" title="Support HBCU baseball">
              Six sponsorship levels from $500 to $50,000 — every contribution helps make the inaugural Invitational
              possible, with remaining proceeds supporting scholarships and Morehouse Baseball.
            </SectionHeader>
            <div className="flex flex-wrap gap-3 -mt-4">
              <Link to={jebiPath('/partnerships')} className="btn-primary uppercase tracking-wider text-sm">
                Sponsorship Levels <ArrowRight className="w-4 h-4" />
              </Link>
              <a href={JEBI.sponsorPacket} className="btn-secondary uppercase tracking-wider text-sm">
                Download Packet
              </a>
            </div>
          </div>
          <Link to={jebiPath('/shop')} className="group block rounded-3xl overflow-hidden ring-1 ring-black/5 relative">
            <img
              src={PHOTOS.jebiMerch.src}
              alt="Jay Edwards Baseball Invitational merchandise mockup: mugs, tumbler, keychains, buttons, pens, lanyards and backpack"
              className="w-full aspect-[3/2] object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-6 flex items-end justify-between">
              <div>
                <span className="eyebrow text-gold">Shop</span>
                <p className="font-display uppercase text-3xl font-bold text-white leading-none mt-2">Official Event Collection</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-gold" aria-hidden="true" />
            </div>
          </Link>
        </div>
      </section>

      {/* Legacy teaser */}
      <section className="container-page">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <img
              src={PHOTOS.boardFounders.src}
              style={{ objectPosition: PHOTOS.boardFounders.position }}
              alt="MTHC founders including Jay Edwards (#12)"
              className="rounded-3xl w-full aspect-[4/3] object-cover shadow-xl"
            />
          </div>
          <div className="lg:col-span-7">
            <SectionHeader eyebrow="The legacy" title={<>Who is Jay “Sanchez” Edwards?</>}>
              A Chicago native, entrepreneur, mentor, coach and philanthropist, Jay helped reestablish Morehouse
              baseball in 1991 after nearly a decade-long absence — and has been developing young men on and off the
              field ever since.
            </SectionHeader>
            <Link to={jebiPath('/about')} className="btn-primary -mt-4 uppercase tracking-wider text-sm">
              Read His Story <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Sponsor strip — only once approved sponsors exist */}
      {SPONSORS.length > 0 && (
        <section className="bg-white border-t border-black/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-6">Thank you to our partners</p>
            <ul className="flex flex-wrap items-center justify-center gap-10">
              {SPONSORS.map((s) => (
                <li key={s.name}>
                  <img src={s.logo} alt={s.name} className="h-12 w-auto object-contain" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
