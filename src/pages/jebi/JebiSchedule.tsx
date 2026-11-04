import { useState } from 'react';
import { GAMES, DAYS, TEAMS } from './data';
import { GameCard, JebiHero } from './components';
import { PHOTOS } from '../../lib/photos';
import usePageTitle from './usePageTitle';

type DayId = (typeof DAYS)[number]['id'] | 'all';

export default function JebiSchedule() {
  usePageTitle('Schedule');
  const [day, setDay] = useState<DayId>('all');
  const [team, setTeam] = useState<string>('all');

  const visibleDays = DAYS.filter((d) => day === 'all' || d.id === day);
  const matchesTeam = (g: (typeof GAMES)[number]) => team === 'all' || g.away === team || g.home === team;

  const tab = (active: boolean) =>
    `px-4 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition ${
      active ? 'bg-jebi text-white shadow' : 'bg-white text-ink/70 ring-1 ring-black/10 hover:text-jebi'
    }`;

  return (
    <>
      <JebiHero
        eyebrow="Schedule"
        title="Nine games. Three days."
        subtitle="All times Eastern (ET). Live Stats and Watch links appear on each game as soon as they're confirmed."
        image={PHOTOS.jebiScheduleHero}
      />

      <section className="container-page">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-10">
          <div role="group" aria-label="Filter by day" className="flex flex-wrap gap-2">
            <button type="button" className={tab(day === 'all')} aria-pressed={day === 'all'} onClick={() => setDay('all')}>
              All Days
            </button>
            {DAYS.map((d) => (
              <button
                key={d.id}
                type="button"
                className={tab(day === d.id)}
                aria-pressed={day === d.id}
                onClick={() => setDay(d.id)}
              >
                {d.label} {d.date}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold text-gray-600">
            Team
            <select value={team} onChange={(e) => setTeam(e.target.value)} className="input !py-2.5 !w-auto">
              <option value="all">All teams</option>
              {TEAMS.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.school}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-14">
          {visibleDays.map((d) => {
            const games = GAMES.filter((g) => g.day === d.id && matchesTeam(g));
            if (games.length === 0) return null;
            return (
              <div key={d.id}>
                <h2 className="font-display uppercase text-3xl md:text-4xl font-bold text-ink flex items-baseline gap-3 mb-6">
                  {d.label}
                  <span className="text-jebi">{d.date}, 2027</span>
                  <span className="flex-1 h-0.5 bg-gradient-to-r from-jebi/40 to-transparent self-center" aria-hidden="true" />
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {games.map((g) => (
                    <GameCard key={g.id} game={g} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-14 text-sm text-gray-500 max-w-2xl">
          Schedule subject to change. Postponements, cancellations, and final scores will be posted on each game card
          with an official dated notice.
        </p>
      </section>
    </>
  );
}
