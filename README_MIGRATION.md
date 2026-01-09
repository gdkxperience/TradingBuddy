# Migration to Next.js Complete! 🎉

Your app has been successfully migrated from Vite to Next.js with Prisma database support.

## What Changed

### ✅ Completed
- ✅ Installed Next.js and Prisma
- ✅ Created Prisma schema with Calculation and User models
- ✅ Set up Next.js app directory structure
- ✅ Migrated App.tsx to app/page.tsx
- ✅ Created API routes at app/api/calculations/route.ts
- ✅ Updated all configuration files
- ✅ All components preserved (no changes needed!)

### 📁 New Structure
```
trading-buddy/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page (was App.tsx)
│   ├── globals.css         # Global styles
│   └── api/
│       └── calculations/
│           └── route.ts    # API endpoints
├── prisma/
│   └── schema.prisma       # Database schema
├── src/                    # All your components (unchanged!)
│   ├── components/
│   ├── lib/
│   │   ├── prisma.ts       # Prisma client
│   │   └── calculations.ts
│   └── types/
└── package.json            # Updated scripts
```

## Next Steps

### 1. Set Up Database

**Option A: Local SQLite (Quick Start)**
```bash
# Update prisma/schema.prisma datasource to:
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

# Then run:
npx prisma generate
npx prisma db push
```

**Option B: Vercel Postgres (Recommended for Production)**
1. Go to Vercel Dashboard → Your Project → Storage
2. Create a Postgres database
3. Copy the connection string
4. Add to `.env`:
   ```
   DATABASE_URL="postgresql://..."
   ```
5. Run: `npx prisma db push`

### 2. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

### 3. Test API Routes

```bash
# Save a calculation
curl -X POST http://localhost:3000/api/calculations \
  -H "Content-Type: application/json" \
  -d '{"mode":"forward","inputs":{...},"result":{...}}'

# Get calculations
curl http://localhost:3000/api/calculations
```

### 4. Deploy to Vercel

1. Push to GitHub
2. Vercel will auto-detect Next.js
3. Add DATABASE_URL environment variable in Vercel dashboard
4. Deploy!

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio (database GUI)

## API Endpoints

### POST /api/calculations
Save a calculation to the database

**Request:**
```json
{
  "mode": "forward",
  "inputs": {
    "accountSize": "10000",
    "entryPrice": "85.00",
    ...
  },
  "result": {
    "maxLoss": 500,
    "tradeValue": 8500,
    ...
  }
}
```

### GET /api/calculations
Get recent calculations

**Query params:**
- `limit` - Number of results (default: 10)
- `mode` - Filter by mode ("forward" | "reverse")

## Database Schema

### Calculation Model
Stores all calculation inputs and results:
- Inputs: accountSize, entryPrice, stopLossPrice, targetPrice, etc.
- Results: maxLoss, tradeValue, rMultiple, etc.
- Metadata: createdAt, updatedAt, userId (for future auth)

### User Model
Ready for future authentication:
- email, name
- Relations to calculations

## Troubleshooting

### Build fails with "DATABASE_URL not found"
- Create `.env` file with `DATABASE_URL` (see .env.example)
- Or use SQLite for local dev (no setup needed)

### Prisma errors
- Run `npx prisma generate` after schema changes
- Run `npx prisma db push` to sync schema

### Import errors
- Make sure all components have `'use client'` if they use hooks
- Check path aliases in tsconfig.json

## What's Next?

Now you can:
1. ✅ Save calculations to database
2. ✅ View calculation history
3. ✅ Add user authentication (NextAuth.js)
4. ✅ Add calculation analytics
5. ✅ Export calculations

Enjoy your full-stack Trading Buddy app! 🚀
