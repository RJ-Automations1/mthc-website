import { db, pool } from './index';
import { games, boardMembers, coaches, awards } from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log('Seeding database...');

  // Seed sample games for 2026 season (25-20 record)
  const sampleGames = [
    { opponent: 'Tuskegee University', date: '2026-02-14', time: '2:00 PM', location: 'Morehouse Field', homeAway: 'home' as const, result: 'W', scoreUs: 7, scoreThem: 3, season: '2026', conference: true },
    { opponent: 'Clark Atlanta University', date: '2026-02-21', time: '1:00 PM', location: 'CAU Stadium', homeAway: 'away' as const, result: 'W', scoreUs: 5, scoreThem: 2, season: '2026', conference: true },
    { opponent: 'Albany State University', date: '2026-02-28', time: '2:00 PM', location: 'Morehouse Field', homeAway: 'home' as const, result: 'L', scoreUs: 3, scoreThem: 6, season: '2026', conference: true },
    { opponent: 'Fort Valley State', date: '2026-03-07', time: '1:00 PM', location: 'Fort Valley', homeAway: 'away' as const, result: 'W', scoreUs: 8, scoreThem: 4, season: '2026', conference: true },
    { opponent: 'Savannah State', date: '2026-03-14', time: '2:00 PM', location: 'Morehouse Field', homeAway: 'home' as const, result: 'W', scoreUs: 6, scoreThem: 1, season: '2026', conference: true },
    { opponent: 'Benedict College', date: '2026-03-21', time: '1:00 PM', location: 'Columbia, SC', homeAway: 'away' as const, result: 'L', scoreUs: 2, scoreThem: 5, season: '2026', conference: true },
    { opponent: 'Lane College', date: '2026-03-28', time: '2:00 PM', location: 'Morehouse Field', homeAway: 'home' as const, result: 'W', scoreUs: 9, scoreThem: 3, season: '2026', conference: true },
    { opponent: 'Miles College', date: '2026-04-04', time: '1:00 PM', location: 'Birmingham, AL', homeAway: 'away' as const, result: 'W', scoreUs: 4, scoreThem: 2, season: '2026', conference: true },
    { opponent: 'Kentucky State', date: '2026-04-11', time: '2:00 PM', location: 'Morehouse Field', homeAway: 'home' as const, result: 'L', scoreUs: 1, scoreThem: 3, season: '2026', conference: true },
    { opponent: 'LeMoyne-Owen', date: '2026-04-18', time: '1:00 PM', location: 'Memphis, TN', homeAway: 'away' as const, result: 'W', scoreUs: 11, scoreThem: 4, season: '2026', conference: true },
  ];

  await db.insert(games).values(sampleGames);

  // Seed board members
  const sampleBoard = [
    { name: 'Board President', title: 'President', bio: 'Morehouse alumnus and dedicated supporter of Maroon Tiger Baseball.', order: 1, active: true },
    { name: 'Board Vice President', title: 'Vice President', bio: 'Committed to advancing the baseball program through community engagement.', order: 2, active: true },
    { name: 'Board Treasurer', title: 'Treasurer', bio: 'Managing the financial growth and sustainability of the MTHC.', order: 3, active: true },
    { name: 'Board Secretary', title: 'Secretary', bio: 'Ensuring organizational excellence and communication.', order: 4, active: true },
  ];

  await db.insert(boardMembers).values(sampleBoard);

  // Seed coaches
  const sampleCoaches = [
    { name: 'Head Coach', title: 'Head Baseball Coach', bio: 'Leading the Maroon Tigers with passion and dedication.', yearsActive: '2020-Present', current: true, order: 1 },
    { name: 'Assistant Coach', title: 'Assistant Coach / Pitching', bio: 'Developing the next generation of Morehouse pitchers.', yearsActive: '2021-Present', current: true, order: 2 },
    { name: 'Assistant Coach', title: 'Assistant Coach / Hitting', bio: 'Building offensive excellence in the program.', yearsActive: '2022-Present', current: true, order: 3 },
  ];

  await db.insert(coaches).values(sampleCoaches);

  // Seed awards/history
  const sampleAwards = [
    { title: 'SIAC Conference Championship', year: '2024', category: 'championship' as const, description: 'Morehouse Baseball wins the SIAC Conference Championship.' },
    { title: 'SIAC Conference Championship', year: '2019', category: 'championship' as const, description: 'Back-to-back era begins with SIAC title.' },
    { title: 'SIAC Player of the Year', year: '2024', category: 'award' as const, description: 'Morehouse player earns top conference honor.' },
    { title: 'Program Revival', year: '2017', category: 'milestone' as const, description: 'Morehouse Baseball program revived after hiatus.' },
    { title: 'First HBCU in NCAA D2 Tournament', year: '2024', category: 'milestone' as const, description: 'Historic appearance in the NCAA Division II Tournament.' },
  ];

  await db.insert(awards).values(sampleAwards);

  console.log('Seeding complete!');
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
