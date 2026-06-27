import { Router } from 'express';
import { db } from '../db';
import { donors, adminUsers, games, boardMembers, coaches } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

// Simple auth middleware (replace with proper JWT in production)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const authMiddleware = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  // In production, verify JWT token here
  // For now, simple token check
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  next();
};

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email));

    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // In production, generate proper JWT
    const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64');

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// GET /api/admin/donors - Get all donors (pending and approved)
router.get('/donors', authMiddleware, async (_req, res) => {
  try {
    const allDonors = await db
      .select()
      .from(donors)
      .orderBy(desc(donors.createdAt));

    res.json(allDonors);
  } catch (error) {
    console.error('Admin donors error:', error);
    res.status(500).json({ message: 'Failed to load donors' });
  }
});

// PATCH /api/admin/donors/:id/approve - Approve a donor for leaderboard
router.patch('/donors/:id/approve', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    await db
      .update(donors)
      .set({ approved: approved ?? true })
      .where(eq(donors.id, Number(id)));

    res.json({ success: true, message: `Donor ${approved ? 'approved' : 'unapproved'}` });
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ message: 'Failed to update donor' });
  }
});

// DELETE /api/admin/donors/:id - Delete a donor
router.delete('/donors/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(donors).where(eq(donors.id, Number(id)));
    res.json({ success: true, message: 'Donor deleted' });
  } catch (error) {
    console.error('Delete donor error:', error);
    res.status(500).json({ message: 'Failed to delete donor' });
  }
});

// POST /api/admin/games - Add a game
router.post('/games', authMiddleware, async (req, res) => {
  try {
    const [game] = await db.insert(games).values(req.body).returning({ id: games.id });
    res.status(201).json({ success: true, id: game.id });
  } catch (error) {
    console.error('Add game error:', error);
    res.status(500).json({ message: 'Failed to add game' });
  }
});

// PUT /api/admin/games/:id - Update a game
router.put('/games/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.update(games).set(req.body).where(eq(games.id, Number(id)));
    res.json({ success: true });
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({ message: 'Failed to update game' });
  }
});

// POST /api/admin/board - Add board member
router.post('/board', authMiddleware, async (req, res) => {
  try {
    const [member] = await db.insert(boardMembers).values(req.body).returning({ id: boardMembers.id });
    res.status(201).json({ success: true, id: member.id });
  } catch (error) {
    console.error('Add board member error:', error);
    res.status(500).json({ message: 'Failed to add board member' });
  }
});

// POST /api/admin/coaches - Add coach
router.post('/coaches', authMiddleware, async (req, res) => {
  try {
    const [coach] = await db.insert(coaches).values(req.body).returning({ id: coaches.id });
    res.status(201).json({ success: true, id: coach.id });
  } catch (error) {
    console.error('Add coach error:', error);
    res.status(500).json({ message: 'Failed to add coach' });
  }
});

export default router;
