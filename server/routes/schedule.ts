import { Router } from 'express';
import { db } from '../db';
import { games } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { fetchOfficialSchedule, officialScheduleUrl } from '../lib/sidearm';

const router = Router();

const tally = (list: { result: string | null }[]) => {
  const wins = list.filter(g => g.result === 'W').length;
  const losses = list.filter(g => g.result === 'L').length;
  return { wins, losses };
};

// GET /api/schedule - Get all games for a season.
// Source of truth is the official morehouseathletics.com schedule; the local
// database is used as a fallback if that site can't be reached.
router.get('/', async (req, res) => {
  const season = (req.query.season as string) || '2026';

  try {
    const official = await fetchOfficialSchedule(season);
    const { wins, losses } = tally(official);
    const conf = tally(official.filter(g => g.conference));

    return res.json({
      season,
      source: 'morehouseathletics',
      officialUrl: officialScheduleUrl(season),
      record: `${wins}-${losses}`,
      wins,
      losses,
      conferenceRecord: `${conf.wins}-${conf.losses}`,
      games: official,
    });
  } catch (error) {
    console.error('Official schedule unavailable, falling back to database:', error);
  }

  try {
    const schedule = await db
      .select()
      .from(games)
      .where(eq(games.season, season))
      .orderBy(desc(games.date));

    const { wins, losses } = tally(schedule);

    res.json({
      season,
      source: 'database',
      officialUrl: officialScheduleUrl(season),
      record: `${wins}-${losses}`,
      wins,
      losses,
      games: schedule,
    });
  } catch (error) {
    console.error('Schedule error:', error);
    res.status(500).json({ message: 'Failed to load schedule' });
  }
});

// GET /api/schedule/upcoming - Get upcoming games
router.get('/upcoming', async (_req, res) => {
  try {
    const official = await fetchOfficialSchedule('2026');
    return res.json(official.filter(g => !g.result && !g.status));
  } catch (error) {
    console.error('Official schedule unavailable, falling back to database:', error);
  }

  try {
    const allGames = await db
      .select()
      .from(games)
      .where(eq(games.season, '2026'));

    const upcoming = allGames.filter(g => !g.result);

    res.json(upcoming);
  } catch (error) {
    console.error('Upcoming games error:', error);
    res.status(500).json({ message: 'Failed to load upcoming games' });
  }
});

export default router;
