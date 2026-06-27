import { Router } from 'express';
import { db } from '../db';
import { coaches, awards } from '../db/schema';
import { eq, desc, asc } from 'drizzle-orm';

const router = Router();

// GET /api/history/coaches - Get all coaches
router.get('/coaches', async (req, res) => {
  try {
    const current = req.query.current === 'true';
    const query = current
      ? db.select().from(coaches).where(eq(coaches.current, true)).orderBy(asc(coaches.order))
      : db.select().from(coaches).orderBy(asc(coaches.order));

    const result = await query;
    res.json(result);
  } catch (error) {
    console.error('Coaches error:', error);
    res.status(500).json({ message: 'Failed to load coaches' });
  }
});

// GET /api/history/awards - Get awards and championships
router.get('/awards', async (req, res) => {
  try {
    const category = req.query.category as string;
    const query = category
      ? db.select().from(awards).where(eq(awards.category, category as any)).orderBy(desc(awards.year))
      : db.select().from(awards).orderBy(desc(awards.year));

    const result = await query;
    res.json(result);
  } catch (error) {
    console.error('Awards error:', error);
    res.status(500).json({ message: 'Failed to load awards' });
  }
});

// GET /api/history/championships - Get SIAC championships specifically
router.get('/championships', async (_req, res) => {
  try {
    const championships = await db
      .select()
      .from(awards)
      .where(eq(awards.category, 'championship'))
      .orderBy(desc(awards.year));

    res.json(championships);
  } catch (error) {
    console.error('Championships error:', error);
    res.status(500).json({ message: 'Failed to load championships' });
  }
});

export default router;
