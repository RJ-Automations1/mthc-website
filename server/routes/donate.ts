import { Router } from 'express';
import { Client, Environment } from 'square';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { donors } from '../db/schema';
import { z } from 'zod';

const router = Router();

// Square client configuration
const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production'
    ? Environment.Production
    : Environment.Sandbox,
});

// Donation tiers
const DONATION_TIERS = {
  single: { name: 'Single', amount: 10000 },    // $100 in cents
  double: { name: 'Double', amount: 20000 },    // $200 in cents
  triple: { name: 'Triple', amount: 30000 },    // $300 in cents
  homerun: { name: 'Home Run', amount: 40000 }, // $400 in cents
} as const;

// Validation schema for donation
const donationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  tier: z.enum(['single', 'double', 'triple', 'homerun']),
  displayName: z.string().optional(),
  anonymous: z.boolean().default(false),
  consentGiven: z.boolean().refine(val => val === true, 'Consent is required'),
  message: z.string().optional(),
  sourceId: z.string().min(1, 'Payment source is required'), // Square payment token
});

// POST /api/donate - Create a donation with Square payment
router.post('/', async (req, res) => {
  try {
    const validated = donationSchema.parse(req.body);
    const tier = DONATION_TIERS[validated.tier];
    const idempotencyKey = uuidv4();

    // Process payment with Square
    const { result } = await squareClient.paymentsApi.createPayment({
      sourceId: validated.sourceId,
      idempotencyKey,
      amountMoney: {
        amount: BigInt(tier.amount),
        currency: 'USD',
      },
      note: `MTHC Donation - ${tier.name} ($${tier.amount / 100})`,
      buyerEmailAddress: validated.email,
    });

    if (!result.payment) {
      throw new Error('Payment processing failed');
    }

    // Store donor in database
    const [donor] = await db.insert(donors).values({
      firstName: validated.firstName,
      lastName: validated.lastName,
      email: validated.email,
      phone: validated.phone || null,
      amount: String(tier.amount / 100),
      tier: validated.tier,
      displayName: validated.anonymous ? 'Anonymous' : (validated.displayName || `${validated.firstName} ${validated.lastName}`),
      anonymous: validated.anonymous,
      approved: false, // Requires manual approval for leaderboard
      squarePaymentId: result.payment.id || null,
      squareOrderId: result.payment.orderId || null,
      consentGiven: validated.consentGiven,
      message: validated.message || null,
    }).returning({ id: donors.id });

    res.status(201).json({
      success: true,
      message: 'Thank you for your donation to the Maroon Tiger Homerun Club!',
      donorId: donor.id,
      paymentId: result.payment.id,
      tier: tier.name,
      amount: tier.amount / 100,
    });
  } catch (error: any) {
    console.error('Donation error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    // Square API errors
    if (error.errors) {
      return res.status(400).json({
        success: false,
        message: 'Payment processing failed',
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'An error occurred processing your donation. Please try again.',
    });
  }
});

// GET /api/donate/tiers - Get available donation tiers
router.get('/tiers', (_req, res) => {
  const tiers = Object.entries(DONATION_TIERS).map(([key, value]) => ({
    id: key,
    name: value.name,
    amount: value.amount / 100,
    description: getTierDescription(key),
  }));
  res.json(tiers);
});

function getTierDescription(tier: string): string {
  switch (tier) {
    case 'single': return 'Support a player with essential gear and equipment.';
    case 'double': return 'Cover travel expenses for an away game.';
    case 'triple': return 'Fund training equipment and facility improvements.';
    case 'homerun': return 'Make a major impact on the entire program.';
    default: return '';
  }
}

export default router;
