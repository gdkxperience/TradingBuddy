# Quick Start: Migrate Local DB to Production

## 🚀 Fastest Path (Vercel Postgres)

### 1. Install dependencies
```bash
npm install
```

### 2. Export your local data
```bash
npm run db:export
```
This creates `prisma/data-export.json` with all your data.

### 3. Set up Vercel Postgres
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project
2. **Storage** → **Create Database** → **Postgres**
3. Copy the connection string

### 4. Update schema for Postgres
Edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 5. Add production database URL
In Vercel Dashboard → **Settings** → **Environment Variables**:
- Name: `DATABASE_URL`
- Value: Your Postgres connection string
- Environment: Production, Preview

### 6. Push schema to production
```bash
npm run db:generate
DATABASE_URL="your-postgres-url" npm run db:push
```

### 7. Import your data
```bash
DATABASE_URL="your-postgres-url" npm run db:import
```

### 8. Verify
```bash
DATABASE_URL="your-postgres-url" npm run db:studio
```

## ✅ Done!

Your local data is now in production. Deploy your app and it will use the production database.

---

## Alternative: Keep SQLite with Turso

If you prefer to stay with SQLite:

1. Sign up at [turso.tech](https://turso.tech)
2. Create database and get URL
3. Update `src/lib/prisma.ts` to use Turso connection
4. Export and import using the same scripts

See `docs/DATABASE_MIGRATION.md` for detailed instructions.
