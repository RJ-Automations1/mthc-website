import { Router } from 'express';
import { db } from '../db';
import { boardMembers } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import { BOARD_MEMBERS } from '../db/init';

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
    // Keep the board visible even if the database is unreachable
    console.error('Board members error, serving built-in board:', error);
    res.json(BOARD_MEMBERS.map((m, i) => ({ id: i + 1, imageUrl: null, ...m })));
  }
});

export default router;
