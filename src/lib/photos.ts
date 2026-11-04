// Every photo used on the site lives here. To swap in a new photo, drop the
// file in public/images/ and change the path below — no page code needs editing.
// `position` is the CSS object-position used when a photo is cropped to fit
// (e.g. a tall portrait shot inside a wide banner) — move it to keep faces in frame.

export interface Photo {
  src: string;
  position?: string;
  /** 'contain' shows the whole photo (used for tall photos in wide banners) */
  fit?: 'cover' | 'contain';
}

export const PHOTOS = {
  logo: '/mthc-logo.png',
  alumniLogo: '/images/morehouse-baseball-alumni-logo.png',

  // Page hero banners
  homeHero: { src: '/images/team-2026.jpg', position: 'center 45%' },
  aboutHero: { src: '/images/den-of-honor-induction.jpg', position: 'center 30%' },
  historyHero: { src: '/images/team-2026.jpg', position: 'center 50%' },
  scheduleHero: { src: '/images/dugout.jpg', position: 'center 42%' },
  donateHero: { src: '/images/program-support.jpg', position: 'center 40%' },
  leaderboardHero: { src: '/images/senior-day.jpg', position: 'center 55%' },
  boardHero: { src: '/images/hbcu-allstar-team-photo.jpg', position: 'center 35%' },

  // Jay Edwards Baseball Invitational (/jebi) page heroes
  // Photos supplied for JEBI live in /images/jebi/photos/
  jebiHomeHero: { src: '/images/jebi/photos/jebi-photo-2.jpg', position: 'center 55%' },
  jebiAboutHero: { src: '/images/jebi/photos/jebi-photo-7.jpg', position: 'center 40%' },
  // Tall photo: shown whole (fit: 'contain') on the right, over a blurred copy, so
  // all three players are visible head to toe with their arms crossed.
  jebiTeamsHero: { src: '/images/jebi/photos/jebi-photo-1.jpg', position: 'center 18%', fit: 'contain' },
  jebiScheduleHero: { src: '/images/jebi/photos/jebi-photo-4.jpg', position: 'center 35%' },
  jebiTicketsHero: { src: '/images/senior-day.jpg', position: 'center 55%' },
  jebiPartnersHero: { src: '/images/jebi/photos/jebi-photo-6.jpg', position: 'center 45%' },
  jebiMediaHero: { src: '/images/jebi/photos/jebi-photo-5.jpg', position: 'center 4%' },
  jebiShopHero: { src: '/images/hbcu-allstar-team-photo.jpg', position: 'center 35%' },
  jebiContactHero: { src: '/images/team-2026.jpg', position: 'center 28%' },
  jebiMerch: { src: '/images/jebi/jebi-merchandise.jpg', position: 'center' },
  // Black-and-white coach portrait (cropped from a Morehouse Baseball post)
  jebiPortrait: { src: '/images/jebi/photos/jebi-photo-3.jpg', position: 'center top' },
  // Photo gallery (Home + Media)
  jebiGallery: [
    { src: '/images/jebi/photos/jebi-photo-2.jpg', position: 'center 55%', alt: 'Morehouse baseball team lined up on the field' },
    { src: '/images/jebi/photos/jebi-photo-6.jpg', position: 'center 45%', alt: 'Players holding ceremonial checks during a field presentation' },
    { src: '/images/jebi/photos/jebi-photo-7.jpg', position: 'center 40%', alt: 'Coaches and supporters gathered at a team dinner' },
    { src: '/images/jebi/photos/jebi-photo-5.jpg', position: 'center 25%', alt: 'Three Morehouse coaches in maroon at the ballpark' },
    { src: '/images/jebi/photos/jebi-photo-1.jpg', position: 'center 30%', alt: 'Three players posing on the field' },
    { src: '/images/jebi/photos/jebi-photo-4.jpg', position: 'center 40%', alt: 'Players watching the game from behind the backstop' },
  ],

  // Board page founders feature (Starr #11, Edwards #12, Phillips #3)
  boardFounders: { src: '/images/board-founders.jpg', position: 'center 40%' },

  // Home page feature split
  homeMission: { src: '/images/catcher-home-plate.jpg', position: 'center 40%' },

  // History page "The Beginning" (shown in black & white, like the original site)
  historyBeginning: { src: '/images/catcher-action.jpg', position: 'center 30%' },

  // Community & Impact gallery (home) — first photo is the large tile
  community: [
    { src: '/images/senior-day.jpg', position: 'center 60%', title: 'Senior Day', desc: 'Honoring our graduating Maroon Tigers at home plate.' },
    { src: '/images/program-support.jpg', position: 'center 40%', title: 'Investing in the Program', desc: 'Supporters delivering new resources to Morehouse Baseball.' },
    { src: '/images/hbcu-allstar-team-photo.jpg', position: 'center 40%', title: 'Giving Back to ATL Youth', desc: 'Players mentoring at the MBP All-Star youth clinic.' },
    { src: '/images/den-of-honor-induction.jpg', position: 'center 35%', title: 'Den of Honor Induction', desc: 'Celebrating excellence with Dr. Reuben Brigety.' },
  ],

  // History page honors graphics
  honors: [
    { src: '/images/siac-portfolio.png', label: 'SIAC Championships' },
    { src: '/images/bcn-poll-champions.jpg', label: 'Black College Nines Poll' },
    { src: '/images/den-of-honor-logo.jpg', label: 'Den of Honor' },
    { src: '/images/morehouse-baseball-athletics.jpg', label: 'Maroon Tigers Baseball' },
  ],
};
