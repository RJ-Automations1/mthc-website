import { Router } from 'express';
import { db } from '../db';
import { boardMembers } from '../db/schema';
import { eq, asc } from 'drizzle-orm';

const router = Router();

// GET /api/board - Get all active board members
router.get('/', async (_req, res) => {
  try {
    const members = await db
      .select()
      .from(boardMembers)
      .where(eq(boardMembers.active, true))
      .orderBy(asc(boardMembers.order));

    res.json(members);
  } catch (error) {
    console.error('Board members error:', error);
    res.status(500).json({ message: 'Failed to load board members' });
  }
});

export default router;
