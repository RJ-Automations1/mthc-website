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
  logo: '/images/jebi/jebi-logo.png',
  sponsorPacket: '/docs/jebi-sponsorship-packet.pdf',

  // Pending — fill in when approved
  ticketsUrl: null as string | null, // approved third-party checkout
  donateUrl: mthcPath('/donate') as string | null, // MTHC donate page
  shopUrl: null as string | null, // e.g. 3RTY4.com storefront once confirmed
  watchUrl: null as string | null, // event-level stream
  liveStatsUrl: null as string | null, // event-level live stats
  mapUrl: null as string | null, // verified venue entrance / parking
};

export const CONTACTS = {
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
  logo: string | null; // add licensed logo path, e.g. /images/jebi/teams/morehouse.png
  blurb: string;
  links: TeamLinks;
}

const PENDING_LINKS: TeamLinks = { schedule: null, roster: null, statistics: null, learnMore: null };

export const TEAMS: Team[] = [
  {
    id: 'morehouse',
    name: 'Morehouse',
    school: 'Morehouse College',
    location: 'Atlanta, GA',
    logo: '/images/morehouse-athletics-logo.png', // white mark — shown on a maroon badge
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
    logo: null,
    blurb: 'The Bleu Devils bring New Orleans baseball to Atlanta for the inaugural Invitational.',
    links: { ...PENDING_LINKS },
  },
  {
    id: 'tuskegee',
    name: 'Tuskegee',
    school: 'Tuskegee University',
    location: 'Tuskegee, AL',
    logo: null,
    blurb: 'The Golden Tigers — a storied SIAC rival with deep HBCU baseball roots.',
    links: { ...PENDING_LINKS },
  },
  {
    id: 'miami-hamilton',
    name: 'Miami Hamilton',
    school: 'Miami University Hamilton',
    location: 'Hamilton, OH',
    logo: null,
    blurb: 'The Harbingers travel south from Ohio to compete in the Invitational field.',
    links: { ...PENDING_LINKS },
  },
  {
    id: 'savannah-state',
    name: 'Savannah State',
    school: 'Savannah State University',
    location: 'Savannah, GA',
    logo: null,
    blurb: 'The Tigers represent coastal Georgia in a weekend of in-state HBCU baseball.',
    links: { ...PENDING_LINKS },
  },
  {
    id: 'rust',
    name: 'Rust College',
    school: 'Rust College',
    location: 'Holly Springs, MS',
    logo: null,
    blurb: 'The Bearcats round out the six-team field from Holly Springs, Mississippi.',
    links: { ...PENDING_LINKS },
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

export const GAMES: Game[] = [
  game('g1', 'fri', '9:30 AM', 'Morehouse', 'Dillard'),
  game('g2', 'fri', '12:30 PM', 'Tuskegee', 'Miami Hamilton'),
  game('g3', 'fri', '3:30 PM', 'Savannah State', 'Rust College'),
  game('g4', 'sat', '9:30 AM', 'Tuskegee', 'Rust College'),
  game('g5', 'sat', '12:30 PM', 'Savannah State', 'Dillard'),
  game('g6', 'sat', '3:30 PM', 'Morehouse', 'Miami Hamilton'),
  game('g7', 'sun', '9:30 AM', 'Tuskegee', 'Dillard'),
  game('g8', 'sun', '12:30 PM', 'Savannah State', 'Miami Hamilton'),
  game('g9', 'sun', '3:30 PM', 'Morehouse', 'Rust College'),
];

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
