import { useEffect, useState } from 'react';
import { Calendar, MapPin, Trophy } from 'lucide-react';
import PageHero from '../components/PageHero';
import { PHOTOS } from '../lib/photos';

interface Game {
  id: number;
  opponent: string;
  date: string;
  time: string;
  location: string;
  homeAway: 'home' | 'away';
  result: string | null;
  scoreUs: number | null;
  scoreThem: number | null;
  conference: boolean;
}

interface ScheduleData {
  season: string;
  record: string;
  wins: number;
  losses: number;
  games: Game[];
}

export default function Schedule() {
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [filter, setFilter] = useState<'all' | 'home' | 'away' | 'conference'>('all');

  useEffect(() => {
    fetch('/api/schedule?season=2026')
      .then(res => res.json())
      .then(data => setSchedule(data))
      .catch(console.error);
  }, []);

  const filteredGames = schedule?.games.filter(game => {
    if (filter === 'home') return game.homeAway === 'home';
    if (filter === 'away') return game.homeAway === 'away';
    if (filter === 'conference') return game.conference;
    return true;
  }) || [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div>
      <PageHero
        eyebrow="2026 Season"
        title={<>Season <span className="text-gold">Schedule</span></>}
        subtitle="Results, upcoming games, and where to catch the Maroon Tigers."
        image={PHOTOS.scheduleHero}
      >
        <div className="inline-flex items-baseline gap-3 rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur px-6 py-4">
          <span className="font-display text-5xl font-bold text-white leading-none">{schedule?.record || '25-20'}</span>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">Overall Record</span>
        </div>
      </PageHero>

      {/* Record Summary */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-cream rounded-2xl p-5 ring-1 ring-black/5">
              <div className="font-display text-4xl font-bold text-green-600">{schedule?.wins || 25}</div>
              <div className="text-sm text-gray-600">Wins</div>
            </div>
            <div className="bg-cream rounded-2xl p-5 ring-1 ring-black/5">
              <div className="font-display text-4xl font-bold text-red-600">{schedule?.losses || 20}</div>
              <div className="text-sm text-gray-600">Losses</div>
            </div>
            <div className="bg-cream rounded-2xl p-5 ring-1 ring-black/5">
              <div className="font-display text-4xl font-bold text-maroon">
                {schedule ? ((schedule.wins / (schedule.wins + schedule.losses)) * 100).toFixed(0) : '56'}%
              </div>
              <div className="text-sm text-gray-600">Win Pct</div>
            </div>
            <div className="bg-cream rounded-2xl p-5 ring-1 ring-black/5">
              <div className="font-display text-4xl font-bold text-maroon">SIAC</div>
              <div className="text-sm text-gray-600">Conference</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container-page">
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'all', label: 'All Games' },
            { id: 'home', label: 'Home' },
            { id: 'away', label: 'Away' },
            { id: 'conference', label: 'Conference' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f.id
                  ? 'bg-maroon text-white'
                  : 'bg-white ring-1 ring-black/10 text-gray-700 hover:ring-maroon/40'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Games List */}
        <div className="space-y-3">
          {filteredGames.length > 0 ? (
            filteredGames.map(game => (
              <div
                key={game.id}
                className={`card p-4 flex flex-col md:flex-row md:items-center md:justify-between ${
                  game.result === 'W' ? 'border-l-4 border-l-green-500' :
                  game.result === 'L' ? 'border-l-4 border-l-red-500' :
                  'border-l-4 border-l-gray-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-center min-w-[80px]">
                    <div className="text-sm text-gray-500">{formatDate(game.date)}</div>
                    <div className="text-xs text-gray-400">{game.time}</div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        game.homeAway === 'home' ? 'bg-maroon/10 text-maroon' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {game.homeAway === 'home' ? 'HOME' : 'AWAY'}
                      </span>
                      {game.conference && (
                        <span className="text-xs px-2 py-0.5 rounded bg-gold/20 text-gold-dark">SIAC</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mt-1">
                      {game.homeAway === 'away' ? '@ ' : 'vs '}{game.opponent}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-0.5">
                      <MapPin className="w-3 h-3 mr-1" />
                      {game.location}
                    </div>
                  </div>
                </div>

                <div className="mt-3 md:mt-0 md:text-right">
                  {game.result ? (
                    <div className={`text-lg font-bold ${
                      game.result === 'W' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {game.result} {game.scoreUs}-{game.scoreThem}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Upcoming
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Trophy className="w-12 h-12 text-maroon/30 mx-auto mb-4" />
              <p>Schedule information loading...</p>
              <p className="text-sm mt-2">Final 2026 Record: 25-20</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
