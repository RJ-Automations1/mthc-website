import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Users, BarChart3, Info, ArrowRight } from 'lucide-react';
import { GAMES, DAYS, TEAMS } from './data';
import { JebiHero, MaybeLink, TeamBadge } from './components';
import { PHOTOS } from '../../lib/photos';
import usePageTitle from './usePageTitle';
import { jebiPath } from '../../lib/siteMode';

const LINK_DEFS = [
  { key: 'schedule', label: 'Schedule', icon: CalendarDays },
  { key: 'roster', label: 'Roster', icon: Users },
  { key: 'statistics', label: 'Statistics', icon: BarChart3 },
  { key: 'learnMore', label: 'Learn More', icon: Info },
] as const;

const dayLabel = (id: string) => {
  const d = DAYS.find((x) => x.id === id);
  return d ? `${d.label.slice(0, 3)}, ${d.date}` : id;
};

export default function JebiTeams() {
  usePageTitle('Teams');
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <>
      <JebiHero
        eyebrow="Teams"
        title="Meet the participating programs"
        subtitle="Six collegiate programs, three days of baseball in Atlanta."
        image={PHOTOS.jebiTeamsHero}
      />

      <section className="container-page">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEAMS.map((team) => {
            const games = GAMES.filter((g) => g.away === team.name || g.home === team.name);
            const open = openId === team.id;
            return (
              <article key={team.id} id={team.id} className="card scroll-mt-40 flex flex-col">
                <div className="bg-gradient-to-br from-jebi to-jebi-dark p-6 flex items-center gap-4">
                  <TeamBadge team={team} size="lg" />
                  <div>
                    <h2 className="font-display uppercase text-2xl font-bold text-white leading-none">{team.school}</h2>
                    <p className="mt-1 text-sm text-white/70">{team.location}</p>
                  </div>
                </div>
                <div className="p-6 flex flex-col gap-5 flex-1">
                  <p className="text-gray-600">{team.blurb}</p>

                  <ul className="grid grid-cols-2 gap-2" aria-label={`${team.school} links`}>
                    {LINK_DEFS.map(({ key, label, icon: Icon }) => (
                      <li key={key}>
                        <MaybeLink
                          href={team.links[key]}
                          className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-jebi/15 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-jebi hover:bg-jebi hover:text-white hover:border-jebi transition w-full"
                          pendingClassName="flex flex-col items-center justify-center rounded-xl bg-gray-50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 w-full"
                        >
                          <Icon className="w-3.5 h-3.5" aria-hidden="true" /> {label}
                        </MaybeLink>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : team.id)}
                      aria-expanded={open}
                      aria-controls={`${team.id}-games`}
                      className="text-sm font-semibold text-jebi hover:underline"
                    >
                      {open ? 'Hide' : 'Show'} Invitational games ({games.length})
                    </button>
                    {open && (
                      <ul id={`${team.id}-games`} className="mt-3 divide-y divide-gray-100 text-sm">
                        {games.map((g) => (
                          <li key={g.id} className="py-2 flex justify-between gap-3">
                            <span className="text-gray-500 shrink-0">
                              {dayLabel(g.day)} · {g.time}
                            </span>
                            <span className="font-semibold text-right">
                              vs. {g.away === team.name ? g.home : g.away}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link to={jebiPath('/schedule')} className="btn-primary uppercase tracking-wider text-sm">
            Full Event Schedule <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
