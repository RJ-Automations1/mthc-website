# Maroon Tiger Homerun Club (MTHC) Website

**mthc1867.org** — The official website for the Maroon Tiger Homerun Club, supporting Morehouse College Baseball.

## Overview

This is a full-stack web application built with:
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Express.js + TypeScript
- **Database**: MySQL (via Drizzle ORM)
- **Payments**: Square Web Payments SDK
- **Styling**: Maroon and white color scheme with gold accents

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero, stats, donation tiers CTA |
| About Us | `/about` | Mission, vision, values |
| History | `/history` | Coaches, awards, SIAC championships |
| Schedule | `/schedule` | 2026 season (25-20 record), game results |
| Donate | `/donate` | Baseball-themed tiers with checkout flow |
| Leaderboard | `/leaderboard` | Approved donor display |
| Board Members | `/board` | MTHC board member profiles |

## Donation Tiers

| Tier | Amount | Description |
|------|--------|-------------|
| Single | $100 | Essential gear and equipment |
| Double | $200 | Travel expenses for away games |
| Triple | $300 | Training equipment and facilities |
| Home Run | $400 | Major program impact |

## Quick Start

### Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- Square Developer Account (for payments)

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` — MySQL connection string
- `SQUARE_ACCESS_TOKEN` — Square API access token
- `SQUARE_LOCATION_ID` — Square location ID
- `SQUARE_ENVIRONMENT` — `sandbox` or `production`

For the frontend (create `.env` in project root):
- `VITE_SQUARE_APP_ID` — Square application ID
- `VITE_SQUARE_LOCATION_ID` — Square location ID

### 3. Database Setup

Run the SQL migration to create tables:

```bash
mysql -u username -p database_name < server/db/migrations/0000_initial.sql
```

Or use Drizzle migrations:

```bash
npm run db:migrate
```

Optionally seed with sample data:

```bash
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

This starts both the Vite dev server (port 5173) and Express API server (port 3001).

### 5. Build for Production

```bash
npm run build
```

### 6. Start Production Server

```bash
NODE_ENV=production npm start
```

## Square Payment Integration

### Setup

1. Create a Square Developer account at https://developer.squareup.com
2. Create an application and get your credentials
3. For testing, use the Sandbox environment
4. Add the Square Web Payments SDK to `index.html`:

```html
<!-- Sandbox -->
<script src="https://sandbox.web.squarecdn.com/v1/square.js"></script>

<!-- Production -->
<script src="https://web.squarecdn.com/v1/square.js"></script>
```

### How It Works

1. User selects a donation tier
2. User fills in personal information
3. User provides consent
4. Square card form tokenizes the card
5. Token is sent to backend `/api/donate`
6. Backend processes payment via Square Payments API
7. Donor record is saved to database (pending approval)

## Admin Features

- **Donor Approval**: Donors must be manually approved before appearing on the leaderboard
- **Game Management**: Add/update game results via admin API
- **Board Management**: Add/update board member profiles

Admin API endpoints require authentication via Bearer token.

## Deployment Options

### Vercel / Netlify (Frontend) + Railway / Render (Backend)

1. Deploy frontend with `npm run build` output from `dist/client`
2. Deploy backend as a Node.js service
3. Set environment variables on both platforms
4. Update `VITE_API_URL` if frontend and backend are on different domains

### Single Server (VPS / DigitalOcean / AWS)

1. Build the project: `npm run build`
2. The production server serves both API and static files
3. Use PM2 or systemd to keep the server running
4. Set up Nginx as a reverse proxy with SSL

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist/ ./dist/
EXPOSE 3001
CMD ["node", "dist/server/index.js"]
```

## Project Structure

```
mthc-website/
├── index.html                 # HTML entry point
├── package.json               # Dependencies and scripts
├── vite.config.ts             # Vite configuration
├── tailwind.config.js         # Tailwind with maroon/gold colors
├── tsconfig.json              # TypeScript config (frontend)
├── drizzle.config.ts          # Drizzle ORM config
├── .env.example               # Environment variables template
├── .gitignore
├── public/
│   └── mthc-logo.png         # MTHC logo file
├── src/                       # Frontend source
│   ├── main.tsx               # React entry point
│   ├── App.tsx                # Router and layout
│   ├── components/
│   │   ├── Header.tsx         # Navigation with logo
│   │   └── Footer.tsx         # Social links, contact
│   ├── pages/
│   │   ├── Home.tsx           # Landing page
│   │   ├── About.tsx          # About Us
│   │   ├── History.tsx        # Coaches, awards, championships
│   │   ├── Schedule.tsx       # 2026 season schedule
│   │   ├── Donate.tsx         # Donation flow with Square
│   │   ├── Leaderboard.tsx    # Donor leaderboard
│   │   └── BoardMembers.tsx   # Board member profiles
│   ├── lib/
│   │   ├── utils.ts           # Utility functions
│   │   ├── api.ts             # API client helpers
│   │   └── square.ts          # Square SDK integration
│   └── styles/
│       └── globals.css        # Tailwind + custom styles
└── server/                    # Backend source
    ├── index.ts               # Express server entry
    ├── tsconfig.json          # TypeScript config (server)
    ├── routes/
    │   ├── donate.ts          # Donation + Square payment
    │   ├── leaderboard.ts     # Public leaderboard
    │   ├── schedule.ts        # Game schedule
    │   ├── admin.ts           # Admin management
    │   ├── board.ts           # Board members
    │   └── history.ts         # Coaches, awards
    └── db/
        ├── index.ts           # Database connection
        ├── schema.ts          # Drizzle ORM schema
        ├── migrate.ts         # Migration runner
        ├── seed.ts            # Sample data seeder
        └── migrations/
            └── 0000_initial.sql  # SQL schema
```

## Contact

- **Email**: Info@mthc1867.org
- **Website**: mthc1867.org
- **Instagram**: @mthc1867
- **X (Twitter)**: @mthc1867
- **TikTok**: @mthc1867

## License

Private — Maroon Tiger Homerun Club. All rights reserved.
