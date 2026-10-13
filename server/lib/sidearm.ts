import * as cheerio from 'cheerio';

// Pulls the official Morehouse Baseball schedule from morehouseathletics.com
// (a Sidearm Sports site) so the MTHC site always matches the athletics department.

const BASE_URL = 'https://morehouseathletics.com';
const CACHE_TTL_MS = 30 * 60 * 1000;

export const officialScheduleUrl = (season: string) =>
  `${BASE_URL}/sports/baseball/schedule/${season}`;

export interface ScheduleGame {
  id: number;
  opponent: string;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  homeAway: 'home' | 'away' | 'neutral';
  result: 'W' | 'L' | 'T' | null;
  scoreUs: number | null;
  scoreThem: number | null;
  conference: boolean;
  status: string | null; // e.g. "Canceled", "Postponed"
  note: string | null; // e.g. "(10 Innings)"
  opponentLogo: string | null;
  boxScoreUrl: string | null;
  recapUrl: string | null;
}

const MONTHS: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
};

const cache = new Map<string, { at: number; games: ScheduleGame[] }>();

const absolute = (href: string | undefined) => {
  if (!href) return null;
  return href.startsWith('http') ? href : `${BASE_URL}${href}`;
};

const clean = (text: string) => text.replace(/\s+/g, ' ').trim();

// "Jan 30 (Fri)" + season "2026" -> "2026-01-30"
function toIsoDate(text: string, season: string): string {
  const m = text.match(/([A-Z][a-z]{2})\s+(\d{1,2})/);
  if (!m || !MONTHS[m[1]]) return `${season}-01-01`;
  return `${season}-${MONTHS[m[1]]}-${m[2].padStart(2, '0')}`;
}

export function parseSchedule(html: string, season: string): ScheduleGame[] {
  const $ = cheerio.load(html);
  const games: ScheduleGame[] = [];

  $('li.sidearm-schedule-game').each((_, el) => {
    const li = $(el);
    const cls = li.attr('class') || '';
    const id = Number(li.attr('data-game-id'));
    const opponent = clean(li.find('.sidearm-schedule-game-opponent-name').first().text());
    if (!id || !opponent) return;

    const dateSpans = li.find('.sidearm-schedule-game-opponent-date span');
    const dateText = clean(dateSpans.eq(0).text());
    const time = clean(dateSpans.eq(1).text());

    const location = li
      .find('.sidearm-schedule-game-location span')
      .map((__, s) => clean($(s).text()))
      .get()
      .filter(Boolean)
      .join(' · ');

    const homeAway = cls.includes('sidearm-schedule-home-game')
      ? 'home'
      : cls.includes('sidearm-schedule-away-game')
        ? 'away'
        : 'neutral';

    const conference = clean(li.find('.sidearm-schedule-game-conference-conference').text()) !== '';

    // Result spans look like ["", "W,", "9-8", "(10 Innings)"] or ["Canceled"]
    const resultParts = li
      .find('.sidearm-schedule-game-result span')
      .map((__, s) => clean($(s).text()))
      .get()
      .filter(Boolean);
    let result: ScheduleGame['result'] = null;
    let scoreUs: number | null = null;
    let scoreThem: number | null = null;
    let status: string | null = null;
    let note: string | null = null;
    const outcome = resultParts[0]?.match(/^([WLT]),?$/);
    if (outcome) {
      result = outcome[1] as ScheduleGame['result'];
      const score = resultParts[1]?.match(/^(\d+)-(\d+)/);
      if (score) {
        scoreUs = Number(score[1]);
        scoreThem = Number(score[2]);
      }
      note = resultParts.slice(2).join(' ') || null;
    } else if (resultParts.length) {
      status = resultParts.join(' ');
    }

    const logo = li.find('.sidearm-schedule-game-opponent-logo img');
    const logoSrc = logo.attr('data-src') || logo.attr('src');

    games.push({
      id,
      opponent,
      date: toIsoDate(dateText, season),
      time,
      location,
      homeAway,
      result,
      scoreUs,
      scoreThem,
      conference,
      status,
      note,
      opponentLogo: absolute(logoSrc),
      boxScoreUrl: absolute(li.find('.sidearm-schedule-game-links-boxscore a').first().attr('href')),
      recapUrl: absolute(li.find('.sidearm-schedule-game-links-recap a').first().attr('href')),
    });
  });

  return games;
}

export async function fetchOfficialSchedule(season: string): Promise<ScheduleGame[]> {
  const hit = cache.get(season);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.games;

  try {
    const res = await fetch(officialScheduleUrl(season), {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MTHC-Website/1.0; +https://mthc1867.org)' },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`morehouseathletics.com responded ${res.status}`);
    const games = parseSchedule(await res.text(), season);
    if (!games.length) throw new Error('No games found on official schedule page');
    cache.set(season, { at: Date.now(), games });
    return games;
  } catch (error) {
    // Serve the last good copy rather than nothing if the athletics site hiccups
    if (hit) return hit.games;
    throw error;
  }
}
