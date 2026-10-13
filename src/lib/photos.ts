// Every photo used on the site lives here. To swap in a new photo, drop the
// file in public/images/ and change the path below — no page code needs editing.
// `position` is the CSS object-position used when a photo is cropped to fit
// (e.g. a tall portrait shot inside a wide banner) — move it to keep faces in frame.

export interface Photo {
  src: string;
  position?: string;
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
