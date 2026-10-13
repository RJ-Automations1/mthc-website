import { useEffect, useState } from 'react';
import { Calendar, MapPin, Trophy, ExternalLink, FileText, BarChart3 } from 'lucide-react';
import PageHero from '../components/PageHero';
import { PHOTOS } from '../lib/photos';

const SEASON = '2026';
const OFFICIAL_URL = `https://morehouseathletics.com/sports/baseball/schedule/${SEASON}`;

interface Game {
  id: number;
  opponent: string;
  date: string;
  time: string | null;
  location: string | null;
  homeAway: 'home' | 'away' | 'neutral';
  result: string | null;
  scoreUs: number | null;
  scoreThem: number | null;
  conference: boolean;
  // Present when the schedule comes from morehouseathletics.com
  status?: string | null;
  note?: string | null;
  opponentLogo?: string | null;
  boxScoreUrl?: string | null;
  recapUrl?: string | null;
}

interface ScheduleData {
  season: string;
  source?: 'morehouseathletics' | 'database';
  officialUrl?: string;
  record: string;
  wins: number;
  losses: number;
  conferenceRecord?: string;
  games: Game[];
}

type Filter = 'all' | 'home' | 'away' | 'neutral' | 'conference';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All Games' },
  { id: 'home', label: 'Home' },
  { id: 'away', label: 'Away' },
  { id: 'neutral', label: 'Neutral' },
  { id: 'conference', label: 'SIAC' },
];

const VENUE_LABEL = { home: 'Home', away: 'Away', neutral: 'Neutral' } as const;

export default function Schedule() {
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    fetch(`/api/schedule?season=${SEASON}`)
      .then(res => {
        if (!res.ok) throw new Error(`Schedule request failed (${res.status})`);
        return res.json();
      })
      .then(data => setSchedule(data))
      .catch(err => {
        console.error(err);
        setLoadFailed(true);
      });
  }, []);

  const officialUrl = schedule?.officialUrl || OFFICIAL_URL;

  const filteredGames = schedule?.games.filter(game => {
    if (filter === 'conference') return game.conference;
    if (filter !== 'all') return game.homeAway === filter;
    return true;
  }) || [];

  const decided = schedule ? schedule.wins + schedule.losses : 0;
  const winPct = decided ? `.${Math.round((schedule!.wins / decided) * 1000).toString().padStart(3, '0')}` : '—';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day: date.getDate(),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    };
  };

  return (
    <div>
      <PageHero
        eyebrow={`${SEASON} Season`}
        title={<>Season <span className="text-gold">Schedule</span></>}
        subtitle="Results, upcoming games, and where to catch the Maroon Tigers."
        image={PHOTOS.scheduleHero}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-baseline gap-3 rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur px-6 py-4">
            <span className="font-display text-5xl font-bold text-white leading-none">{schedule?.record || '—'}</span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">Overall Record</span>
          </div>
          <a href={officialUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost-light text-sm uppercase tracking-wider">
            Official Schedule <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </PageHero>

      {/* Record Summary */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-cream rounded-2xl p-5 ring-1 ring-black/5">
              <div className="font-display text-4xl font-bold text-green-600">{schedule?.wins ?? '—'}</div>
              <div className="text-sm text-gray-600">Wins</div>
            </div>
            <div className="bg-cream rounded-2xl p-5 ring-1 ring-black/5">
              <div className="font-display text-4xl font-bold text-red-600">{schedule?.losses ?? '—'}</div>
              <div className="text-sm text-gray-600">Losses</div>
            </div>
            <div className="bg-cream rounded-2xl p-5 ring-1 ring-black/5">
              <div className="font-display text-4xl font-bold text-maroon">{winPct}</div>
              <div className="text-sm text-gray-600">Win Pct</div>
            </div>
            <div className="bg-cream rounded-2xl p-5 ring-1 ring-black/5">
              <div className="font-display text-4xl font-bold text-maroon">{schedule?.conferenceRecord || 'SIAC'}</div>
              <div className="text-sm text-gray-600">{schedule?.conferenceRecord ? 'SIAC Record' : 'Conference'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Games */}
      <section className="container-page">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
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
          {schedule?.source === 'morehouseathletics' && (
            <p className="text-xs text-gray-500">
              Live from{' '}
              <a href={officialUrl} target="_blank" rel="noopener noreferrer" className="text-maroon font-semibold hover:underline">
                MorehouseAthletics.com
              </a>
            </p>
          )}
        </div>

        <div className="space-y-3">
          {filteredGames.length > 0 ? (
            filteredGames.map(game => {
              const d = formatDate(game.date);
              const accent =
                game.result === 'W' ? 'border-l-green-500' : game.result === 'L' ? 'border-l-red-500' : 'border-l-gray-300';
              return (
                <div key={game.id} className={`card hover:translate-y-0 border-l-4 ${accent} p-4 md:p-5`}>
                  <div className="flex items-center gap-4 md:gap-6">
                    {/* Date */}
                    <div className="text-center w-14 shrink-0">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-maroon">{d.month}</div>
                      <div className="font-display text-3xl font-bold text-ink leading-none">{d.day}</div>
                      <div className="text-[11px] text-gray-500">{d.weekday}</div>
                    </div>

                    {/* Opponent logo */}
                    <div className="hidden sm:flex w-12 h-12 shrink-0 rounded-full bg-cream ring-1 ring-black/5 items-center justify-center overflow-hidden">
                      {game.opponentLogo ? (
                        <img src={game.opponentLogo} alt="" loading="lazy" className="w-9 h-9 object-contain" />
                      ) : (
                        <Trophy className="w-5 h-5 text-maroon/30" />
                      )}
                    </div>

                    {/* Matchup */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          game.homeAway === 'home' ? 'bg-maroon/10 text-maroon' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {VENUE_LABEL[game.homeAway].toUpperCase()}
                        </span>
                        {game.conference && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-gold/20 text-gold-dark">SIAC</span>
                        )}
                        {game.time && <span className="text-xs text-gray-500">{game.time}</span>}
                      </div>
                      <h3 className="font-semibold text-gray-900 mt-1 truncate">
                        {game.homeAway === 'away' ? 'at ' : 'vs '}{game.opponent}
                      </h3>
                      {game.location && (
                        <div className="flex items-center text-sm text-gray-500 mt-0.5">
                          <MapPin className="w-3 h-3 mr-1 shrink-0" />
                          <span className="truncate">{game.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Result */}
                    <div className="text-right shrink-0">
                      {game.result ? (
                        <>
                          <div className={`font-display text-2xl font-bold leading-none ${
                            game.result === 'W' ? 'text-green-600' : game.result === 'L' ? 'text-red-600' : 'text-gray-700'
                          }`}>
                            {game.result} {game.scoreUs}-{game.scoreThem}
                          </div>
                          {game.note && <div className="text-[11px] text-gray-500 mt-1">{game.note}</div>}
                        </>
                      ) : game.status ? (
                        <div className="text-sm italic text-gray-500">{game.status}</div>
                      ) : (
                        <div className="text-sm text-gray-400 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Upcoming
                        </div>
                      )}
                      {(game.boxScoreUrl || game.recapUrl) && (
                        <div className="flex justify-end gap-3 mt-2">
                          {game.boxScoreUrl && (
                            <a href={game.boxScoreUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-maroon hover:underline">
                              <BarChart3 className="w-3 h-3" /> Box
                            </a>
                          )}
                          {game.recapUrl && (
                            <a href={game.recapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-maroon hover:underline">
                              <FileText className="w-3 h-3" /> Recap
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Trophy className="w-12 h-12 text-maroon/30 mx-auto mb-4" />
              {schedule ? (
                <p>No games match this filter.</p>
              ) : (
                <>
                  <p>{loadFailed ? 'The schedule could not be loaded right now.' : 'Loading schedule...'}</p>
                  <a href={officialUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6 text-sm">
                    View on MorehouseAthletics.com <ExternalLink className="w-4 h-4" />
                  </a>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
