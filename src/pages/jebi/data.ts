// ─────────────────────────────────────────────────────────────────────────────
// Jay Edwards Baseball Invitational (JEBI) — all event content lives here.
//
// To go live with a link, replace `null` with the approved URL. Any link left as
// `null` shows on the site as "Coming soon" (non-clickable) instead of a broken
// link, per the JEBI wireframe. No page code needs editing.
// ─────────────────────────────────────────────────────────────────────────────

import { jebiPath, mthcPath } from '../../lib/siteMode';

export const JEBI = {
  name: 'Jay Edwards Baseball Invitational',
  shortName: 'JEBI',
  edition: 'Inaugural',
  dates: 'February 5–7, 2027',
  datesShort: 'Feb 5–7, 2027',
  venue: 'Gresham Park',
  city: 'Atlanta, GA',
  address: '2466 Bouldercrest Rd, Atlanta, GA 30316',
  logo: '/images/jebi/jebi-logo.png',
  sponsorPacket: '/docs/jebi-sponsorship-packet.pdf',

  // Pending — fill in when approved
  ticketsUrl: null as string | null, // approved third-party checkout
  donateUrl: mthcPath('/donate') as string | null, // MTHC donate page
  shopUrl: null as string | null, // e.g. 3RTY4.com storefront once confirmed
  watchUrl: null as string | null, // event-level stream
  liveStatsUrl: null as string | null, // event-level live stats
  // Directions to the venue address
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Gresham+Park+2466+Bouldercrest+Rd+Atlanta+GA+30316' as
    | string
    | null,
};

export const CONTACTS = {
  // Primary event contact (from the JEBI Contact doc)
  event: {
    name: 'Sheriee K. Davis, J.D.',
    title: 'CFO',
    org: 'The JBE Group, LLC',
    phone: '(404) 538-8840',
    email: 'sdavis@jmegroupllc.com',
  },
  sponsorship: {
    name: 'Sheriee Davis',
    phone: '(470) 553-8143',
    email: 'sdavis@mthc1867.org',
  },
  media: {
    name: 'Perez Sports Group, LLC',
    email: 'jebi@perezsportsgroup.com',
  },
  general: {
    name: 'Maroon Tiger Homerun Club',
    email: 'Info@mthc1867.org',
  },
  checks: {
    payable: 'Maroon Tiger Homerun Club, Inc. (or MTHC)',
    attn: 'Attn: MTHC, Sheriee Davis',
    address: ['P.O. Box 264', 'Snellville, GA 30078'],
  },
};

export const JEBI_NAV = [
  { name: 'Home', href: jebiPath(), desc: 'Event overview' },
  { name: 'About', href: jebiPath('/about'), desc: 'Mission & the Jay Edwards story' },
  { name: 'Teams', href: jebiPath('/teams'), desc: 'Six participating programs' },
  { name: 'Schedule', href: jebiPath('/schedule'), desc: 'Nine games, live stats & streams' },
  { name: 'Tickets', href: jebiPath('/tickets'), desc: 'Passes & fan info' },
  { name: 'Partnerships', href: jebiPath('/partnerships'), desc: 'Sponsor or donate' },
  { name: 'Media', href: jebiPath('/media'), desc: 'News, credentials & press kit' },
  { name: 'Shop', href: jebiPath('/shop'), desc: 'Official event collection' },
  { name: 'Contact', href: jebiPath('/contact'), desc: 'Reach the right team' },
];

// ── Teams ────────────────────────────────────────────────────────────────────
export interface TeamLinks {
  schedule: string | null;
  roster: string | null;
  statistics: string | null;
  learnMore: string | null;
}

export interface Team {
  id: string;
  name: string; // name used in the schedule
  school: string;
  location: string;
  logo: string | null; // /images/jebi/teams/<id>.png
  blurb: string;
  links: TeamLinks;
}

// Learn More links come from the JEBI Teams doc. Schedule/roster/stats links were
// checked live (Nov 2026). Dillard and Rust publish by season — update their
// 2025-26 links to 2026-27 once those pages go up. `null` = "Coming soon".
export const TEAMS: Team[] = [
  {
    id: 'morehouse',
    name: 'Morehouse',
    school: 'Morehouse College',
    location: 'Atlanta, GA',
    logo: '/images/jebi/teams/morehouse.png',
    blurb: 'The host Maroon Tigers — the program Jay Edwards helped reestablish in 1991 and still coaches today.',
    links: {
      schedule: 'https://morehouseathletics.com/sports/baseball/schedule',
      roster: 'https://morehouseathletics.com/sports/baseball/roster',
      statistics: 'https://morehouseathletics.com/sports/baseball/stats',
      learnMore: 'https://morehouseathletics.com/sports/baseball',
    },
  },
  {
    id: 'dillard',
    name: 'Dillard',
    school: 'Dillard University',
    location: 'New Orleans, LA',
    logo: '/images/jebi/teams/dillard.png',
    blurb: 'The Bleu Devils bring New Orleans baseball to Atlanta for the inaugural Invitational.',
    links: {
      schedule: 'https://www.dillardbleudevils.com/sports/bsb/2025-26/schedule',
      roster: 'https://www.dillardbleudevils.com/sports/bsb/2025-26/roster',
      statistics: null,
      learnMore: 'https://www.dillardbleudevils.com/sports/bsb/index',
    },
  },
  {
    id: 'tuskegee',
    name: 'Tuskegee',
    school: 'Tuskegee University',
    location: 'Tuskegee, AL',
    logo: '/images/jebi/teams/tuskegee.png',
    blurb: 'The Golden Tigers — a storied SIAC rival with deep HBCU baseball roots.',
    links: {
      schedule: 'https://goldentigersports.com/sports/baseball/schedule',
      roster: 'https://goldentigersports.com/sports/baseball/roster',
      statistics: 'https://goldentigersports.com/sports/baseball/stats',
      learnMore: 'https://goldentigersports.com/sports/baseball',
    },
  },
  {
    id: 'miami-hamilton',
    name: 'Miami Hamilton',
    school: 'Miami University Hamilton',
    location: 'Hamilton, OH',
    logo: '/images/jebi/teams/miami-hamilton.png',
    blurb: 'The Harriers travel south from Ohio to compete in the Invitational field.',
    links: {
      schedule: 'https://miamioh.edu/regionals/athletics/harriers/sports/mens/baseball/schedule-and-results/index.html',
      roster: 'https://miamioh.edu/regionals/athletics/harriers/sports/mens/baseball/roster.html',
      statistics: null,
      learnMore: 'https://miamioh.edu/regionals/athletics/harriers/sports/mens/baseball/',
    },
  },
  {
    id: 'savannah-state',
    name: 'Savannah State',
    school: 'Savannah State University',
    location: 'Savannah, GA',
    logo: '/images/jebi/teams/savannah-state.png',
    blurb: 'The Tigers represent coastal Georgia in a weekend of in-state HBCU baseball.',
    links: {
      schedule: 'https://ssuathletics.com/sports/baseball/schedule',
      roster: 'https://ssuathletics.com/sports/baseball/roster',
      statistics: 'https://ssuathletics.com/sports/baseball/stats',
      learnMore: 'https://ssuathletics.com/sports/baseball',
    },
  },
  {
    id: 'rust',
    name: 'Rust College',
    school: 'Rust College',
    location: 'Holly Springs, MS',
    logo: '/images/jebi/teams/rust.png',
    blurb: 'The Bearcats round out the six-team field from Holly Springs, Mississippi.',
    links: {
      schedule: 'https://rustathletics.com/sports/bsb/2025-26/schedule',
      roster: 'https://rustathletics.com/sports/bsb/2025-26/roster',
      statistics: null,
      learnMore: 'https://rustathletics.com/sports/bsb/index',
    },
  },
];

// ── Schedule (all times Eastern) ─────────────────────────────────────────────
export type GameStatus = 'scheduled' | 'live' | 'final' | 'postponed' | 'canceled';

export interface Game {
  id: string;
  day: 'fri' | 'sat' | 'sun';
  time: string;
  away: string;
  home: string;
  status: GameStatus;
  liveStatsUrl: string | null;
  watchUrl: string | null;
  // Fill in once final
  score?: { away: number; home: number };
  boxScoreUrl?: string | null;
  notice?: string; // dated notice for postponed / canceled games
}

export const DAYS = [
  { id: 'fri', label: 'Friday', date: 'Feb 5' },
  { id: 'sat', label: 'Saturday', date: 'Feb 6' },
  { id: 'sun', label: 'Sunday', date: 'Feb 7' },
] as const;

const game = (id: string, day: Game['day'], time: string, away: string, home: string): Game => ({
  id,
  day,
  time,
  away,
  home,
  status: 'scheduled',
  liveStatsUrl: null,
  watchUrl: null,
});

// Updated schedule (Nov 9, 2026). Note: Savannah State plays twice Saturday and
// Morehouse twice Sunday — each team still plays three games.
export const GAMES: Game[] = [
  game('g1', 'fri', '9:30 AM', 'Morehouse', 'Dillard'),
  game('g2', 'fri', '12:30 PM', 'Tuskegee', 'Miami Hamilton'),
  game('g3', 'fri', '3:30 PM', 'Savannah State', 'Rust College'),
  game('g4', 'sat', '9:30 AM', 'Savannah State', 'Miami Hamilton'),
  game('g5', 'sat', '12:30 PM', 'Savannah State', 'Dillard'),
  game('g6', 'sat', '3:30 PM', 'Tuskegee', 'Rust College'),
  game('g7', 'sun', '9:30 AM', 'Morehouse', 'Miami Hamilton'),
  game('g8', 'sun', '12:30 PM', 'Tuskegee', 'Dillard'),
  game('g9', 'sun', '3:30 PM', 'Morehouse', 'Rust College'),
];

// ── Calendar links ───────────────────────────────────────────────────────────
// Game slots are three hours apart, so each game is blocked as a 3-hour event.
const DAY_ISO: Record<Game['day'], string> = { fri: '20270205', sat: '20270206', sun: '20270207' };

const to24 = (t: string) => {
  const [hm, ap] = t.split(' ');
  let [h, m] = hm.split(':').map(Number);
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return { h, m };
};

const stamp = (day: Game['day'], h: number, m: number) =>
  `${DAY_ISO[day]}T${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}00`;

export const gameTimes = (g: Game) => {
  const { h, m } = to24(g.time);
  return { start: stamp(g.day, h, m), end: stamp(g.day, h + 3, m) };
};

export const gameTitle = (g: Game) => `${g.away} vs. ${g.home} — Jay Edwards Baseball Invitational`;

/** Google Calendar "add event" link, in Eastern time. */
export const googleCalendarUrl = (g: Game) => {
  const { start, end } = gameTimes(g);
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: gameTitle(g),
    dates: `${start}/${end}`,
    ctz: 'America/New_York',
    location: `${JEBI.venue}, ${JEBI.address}`,
    details: `Inaugural Jay Edwards Baseball Invitational. Schedule: https://jebi-tjbj.onrender.com/schedule`,
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
};

/** Full schedule as an .ics calendar file (works with Apple, Outlook and Google). */
export const scheduleIcs = (games: Game[] = GAMES) => {
  const esc = (s: string) => s.replace(/([,;\\])/g, '\\$1');
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const events = games.map((g) => {
    const { start, end } = gameTimes(g);
    return [
      'BEGIN:VEVENT',
      `UID:jebi-2027-${g.id}@mthc1867.org`,
      `DTSTAMP:${now}`,
      `DTSTART;TZID=America/New_York:${start}`,
      `DTEND;TZID=America/New_York:${end}`,
      `SUMMARY:${esc(gameTitle(g))}`,
      `LOCATION:${esc(`${JEBI.venue}, ${JEBI.address}`)}`,
      'END:VEVENT',
    ].join('\r\n');
  });
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MTHC//JEBI 2027//EN', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR'].join('\r\n');
};

// ── Sponsorship tiers (from JEBI Sponsor Letter V6) ──────────────────────────
export interface Tier {
  name: string;
  amount: number;
  pitch: string;
  benefits: string[];
}

export const TIERS: Tier[] = [
  {
    name: 'Dugout',
    amount: 500,
    pitch: 'Support the foundation of the tournament and help us provide a first-class experience for participating student-athletes.',
    benefits: [
      'Official sponsorship acknowledgment',
      'Professional thank-you letter/receipt for contribution',
      'Organization tax ID information provided for records',
      'Jay Edwards Baseball Invitational commemorative item',
    ],
  },
  {
    name: 'Diamond',
    amount: 1000,
    pitch: 'Show your commitment to collegiate baseball and the continued development of student-athletes.',
    benefits: [
      'All Dugout Sponsor benefits',
      'Enhanced recognition as a supporter of the Jay Edwards Baseball Invitational',
      'Diamond level sponsor commemorative item',
    ],
  },
  {
    name: 'Homerun',
    amount: 2500,
    pitch: 'Make a significant investment in the Invitational and help us create a memorable tournament experience for players, coaches, and fans.',
    benefits: [
      'All Diamond Sponsor benefits',
      'Recognition in select Invitational promotional materials',
      'Homerun level sponsor commemorative item',
    ],
  },
  {
    name: 'Pennant',
    amount: 5000,
    pitch: 'Become a major supporter of the event and help advance the mission of celebrating HBCU baseball and the legacy of Jay Edwards.',
    benefits: [
      'All Homerun Sponsor benefits',
      'Sponsor mentions between innings',
      'Enhanced placement in event promotional materials and sponsor acknowledgments',
      'Pennant level sponsor commemorative item',
    ],
  },
  {
    name: 'Affiliate',
    amount: 10000,
    pitch: "Join us as a premier partner of the Jay Edwards Baseball Invitational and demonstrate your organization's commitment to athletics, education, mentorship, and community.",
    benefits: [
      'All Pennant Sponsor benefits',
      'Opportunity to provide a company banner for display at the Invitational',
      'Sponsor representative photo opportunity and ceremonial handshake',
      'Opportunity to provide promotional items for participant swag bags',
      'Opportunity to provide branded giveaway items',
      'Recognition through a 15-second commercial on the SIAC Network',
      'Commercial recognition during games and select Morehouse College home games',
      'Company logo featured on the Invitational website, marketing materials and social media',
      'Commemorative Affiliate Sponsor item',
    ],
  },
  {
    name: 'Title',
    amount: 50000,
    pitch: 'Become the premier sponsor of the Inaugural Jay Edwards Baseball Invitational and help build a lasting tradition of HBCU collegiate baseball in Atlanta.',
    benefits: [
      'All Affiliate Sponsor benefits',
      'Premier naming recognition as Title Sponsor of the Inaugural Jay Edwards Baseball Invitational',
      'Company logo incorporated with the event title on designated promotional materials',
      'Title Sponsor recognition in official press releases',
      '30-second commercial recognition on SIAC Network',
      'Commercial exposure during the Invitational and designated 2027 Morehouse College home games',
      'Sponsor recognition during the 5th- and/or 7th-inning stretches',
      'Premium sponsor visibility throughout the event',
      'Additional recognition opportunities coordinated with Invitational leadership',
      'Sponsor representative one-on-one time and photo with Jay Edwards',
      'Signed commemorative Title Sponsor item',
    ],
  },
];

// Approved sponsors only — add { name, logo, href? } once commitments are confirmed.
export const SPONSORS: { name: string; logo: string; href?: string }[] = [];

export const formatMoney = (n: number) => `$${n.toLocaleString('en-US')}`;
