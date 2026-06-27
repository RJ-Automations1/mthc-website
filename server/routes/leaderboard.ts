import { Router } from 'express';
import { db } from '../db';
import { donors } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';

const router = Router();

// GET /api/leaderboard - Get approved donors for public leaderboard
router.get('/', async (_req, res) => {
  try {
    const approvedDonors = await db
      .select({
        id: donors.id,
        displayName: donors.displayName,
        tier: donors.tier,
        amount: donors.amount,
        message: donors.message,
        createdAt: donors.createdAt,
      })
      .from(donors)
      .where(and(eq(donors.approved, true), eq(donors.consentGiven, true)))
      .orderBy(desc(donors.amount), desc(donors.createdAt));

    // Group by tier for display
    const leaderboard = {
      homerun: approvedDonors.filter(d => d.tier === 'homerun'),
      triple: approvedDonors.filter(d => d.tier === 'triple'),
      double: approvedDonors.filter(d => d.tier === 'double'),
      single: approvedDonors.filter(d => d.tier === 'single'),
      totalDonors: approvedDonors.length,
      totalRaised: approvedDonors.reduce((sum, d) => sum + Number(d.amount), 0),
    };

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Failed to load leaderboard' });
  }
});

// GET /api/leaderboard/stats - Get donation statistics
router.get('/stats', async (_req, res) => {
  try {
    const allApproved = await db
      .select({
        amount: donors.amount,
        tier: donors.tier,
      })
      .from(donors)
      .where(eq(donors.approved, true));

    const stats = {
      totalDonors: allApproved.length,
      totalRaised: allApproved.reduce((sum, d) => sum + Number(d.amount), 0),
      tierBreakdown: {
        single: allApproved.filter(d => d.tier === 'single').length,
        double: allApproved.filter(d => d.tier === 'double').length,
        triple: allApproved.filter(d => d.tier === 'triple').length,
        homerun: allApproved.filter(d => d.tier === 'homerun').length,
      },
    };

    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Failed to load stats' });
  }
});

export default router;
