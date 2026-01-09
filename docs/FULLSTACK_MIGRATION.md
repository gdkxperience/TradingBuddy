# Full-Stack Migration Guide

## Recommended Approach: Next.js + Prisma + Vercel Postgres

**Why this is the easiest/fastest:**
- ✅ You're already on Vercel (Next.js is made by Vercel)
- ✅ Zero-config database with Vercel Postgres
- ✅ Keep 90% of your React code (minimal changes)
- ✅ API routes built-in (no separate backend)
- ✅ Prisma is the easiest ORM
- ✅ Type-safe end-to-end
- ✅ Free tier available

## Migration Steps

### Option 1: Quick Migration (Recommended)

#### Step 1: Install Next.js and Prisma

```bash
# Install Next.js and required dependencies
npm install next@latest react@latest react-dom@latest
npm install @prisma/client
npm install -D prisma

# Remove Vite (optional, can keep for reference)
npm uninstall vite @vitejs/plugin-react
```

#### Step 2: Update package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  }
}
```

#### Step 3: Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Database schema
- `.env` - Environment variables

#### Step 4: Configure Database

**For Vercel Postgres (Easiest):**

1. Go to Vercel Dashboard → Your Project → Storage → Create Database → Postgres
2. Copy the connection string
3. Add to `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

**For Local Development (SQLite - Fastest to start):**

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

#### Step 5: Create Database Schema

Edit `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or "sqlite" for local dev
  url      = env("DATABASE_URL")
}

model Calculation {
  id                String   @id @default(cuid())
  userId            String?  // For future user accounts
  mode              String   // "forward" | "reverse"
  
  // Forward calculation inputs
  accountSize       Float?
  riskPercentage   Float?
  entryPrice        Float
  stopLossPrice     Float?
  targetPrice       Float?
  tradeType         String   // "long" | "short"
  excessLiquidity   Float?
  
  // Reverse calculation inputs
  availableCash     Float?
  cashUsagePercent  Float?
  
  // Results
  maxLoss           Float?
  riskPerShare      Float?
  maxShares         Float?
  tradeValue        Float?
  initialMarginCost Float?
  rMultiple         Float?
  potentialProfit   Float?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model User {
  id           String        @id @default(cuid())
  email        String        @unique
  name         String?
  calculations Calculation[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}
```

#### Step 6: Generate Prisma Client

```bash
npx prisma generate
npx prisma db push  # Creates tables in database
```

#### Step 7: Restructure Project

Create this structure:
```
trading-buddy/
├── app/                    # Next.js 13+ app directory
│   ├── layout.tsx
│   ├── page.tsx           # Main page (migrate from src/App.tsx)
│   ├── api/               # API routes
│   │   └── calculations/
│   │       └── route.ts
│   └── globals.css
├── src/
│   ├── components/         # Keep all your components
│   ├── lib/
│   │   ├── prisma.ts      # Prisma client singleton
│   │   └── calculations.ts # Keep existing
│   └── types/             # Keep existing
├── prisma/
│   └── schema.prisma
└── public/                # Static assets
```

#### Step 8: Create Prisma Client Singleton

`src/lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

#### Step 9: Create API Route

`app/api/calculations/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Save calculation to database
    const calculation = await prisma.calculation.create({
      data: {
        mode: data.mode,
        accountSize: data.accountSize,
        entryPrice: data.entryPrice,
        stopLossPrice: data.stopLossPrice,
        targetPrice: data.targetPrice,
        tradeType: data.tradeType,
        // ... other fields
      }
    })
    
    return NextResponse.json({ success: true, calculation })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const calculations = await prisma.calculation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    
    return NextResponse.json({ calculations })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
```

#### Step 10: Migrate App.tsx to Next.js

`app/page.tsx`:
```typescript
'use client' // Next.js 13+ client component

import { useState } from 'react'
// ... rest of your App.tsx code (minimal changes needed)
```

#### Step 11: Update Imports

Change:
- `@/components/...` → Keep as is (Next.js supports path aliases)
- Add `'use client'` to components that use hooks

#### Step 12: Create next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
```

#### Step 13: Update tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Option 2: Keep Vite + Add Express Backend (Alternative)

If you prefer to keep Vite:

1. **Create separate backend:**
```bash
mkdir backend
cd backend
npm init -y
npm install express prisma @prisma/client cors
```

2. **Create Express server:**
```typescript
// backend/server.ts
import express from 'express'
import cors from 'cors'
import { prisma } from './lib/prisma'

const app = express()
app.use(cors())
app.use(express.json())

app.post('/api/calculations', async (req, res) => {
  // Save to database
})

app.listen(3001)
```

3. **Update frontend to call API:**
```typescript
// In your components
const saveCalculation = async (data) => {
  await fetch('http://localhost:3001/api/calculations', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}
```

**Cons:** More complex deployment, CORS issues, two separate apps

## Database Options Comparison

### 1. Vercel Postgres (Recommended)
- ✅ Zero config
- ✅ Free tier: 256 MB storage
- ✅ Integrated with Vercel
- ✅ Automatic backups
- Setup: 2 minutes

### 2. Supabase (Great Alternative)
- ✅ Free tier: 500 MB
- ✅ Built-in auth
- ✅ Real-time features
- ✅ Great dashboard
- Setup: 5 minutes

### 3. PlanetScale (MySQL)
- ✅ Serverless MySQL
- ✅ Free tier: 5 GB
- ✅ Branching (like Git)
- Setup: 5 minutes

### 4. Railway / Render
- ✅ PostgreSQL
- ✅ Free tier available
- ✅ Simple setup
- Setup: 5 minutes

### 5. SQLite (Local Dev Only)
- ✅ No setup needed
- ✅ Perfect for development
- ❌ Not for production
- Setup: 1 minute

## Quick Start Commands

```bash
# 1. Install dependencies
npm install next@latest react@latest react-dom@latest @prisma/client
npm install -D prisma

# 2. Initialize Prisma
npx prisma init

# 3. Configure database (edit prisma/schema.prisma and .env)

# 4. Generate Prisma client
npx prisma generate
npx prisma db push

# 5. Start dev server
npm run dev
```

## What You Can Build Now

### 1. Save Calculations History
```typescript
// Save calculation
await fetch('/api/calculations', {
  method: 'POST',
  body: JSON.stringify(calculationData)
})

// Load history
const { calculations } = await fetch('/api/calculations').then(r => r.json())
```

### 2. User Accounts (Future)
- Add NextAuth.js for authentication
- Link calculations to users
- User preferences

### 3. Analytics
- Track most common calculations
- Popular trade types
- Average R-multiples

## Migration Checklist

- [ ] Install Next.js and Prisma
- [ ] Set up database (Vercel Postgres recommended)
- [ ] Create Prisma schema
- [ ] Generate Prisma client
- [ ] Create API routes
- [ ] Migrate App.tsx to app/page.tsx
- [ ] Add 'use client' to components with hooks
- [ ] Test database operations
- [ ] Deploy to Vercel
- [ ] Verify everything works

## Estimated Time

- **Quick migration:** 1-2 hours
- **With testing:** 2-3 hours
- **Full features:** 1 day

## Need Help?

- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres

---

**Recommendation:** Go with **Next.js + Prisma + Vercel Postgres**. It's the fastest path and integrates perfectly with your existing Vercel deployment.
