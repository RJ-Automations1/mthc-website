import { Router } from 'express';
import { db } from '../db';
import { games } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// GET /api/schedule - Get all games for current season
router.get('/', async (req, res) => {
  try {
    const season = (req.query.season as string) || '2026';

    const schedule = await db
      .select()
      .from(games)
      .where(eq(games.season, season))
      .orderBy(desc(games.date));

    // Calculate record
    const wins = schedule.filter(g => g.result === 'W').length;
    const losses = schedule.filter(g => g.result === 'L').length;

    res.json({
      season,
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
