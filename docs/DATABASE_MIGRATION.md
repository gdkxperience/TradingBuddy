# Database Migration Guide: Local SQLite to Production

This guide covers transferring your local SQLite database to production.

## Option 1: Vercel Postgres (Recommended)

### Step 1: Set Up Vercel Postgres

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** → **Create Database** → **Postgres**
4. Copy the connection string (looks like: `postgres://user:pass@host:5432/dbname`)

### Step 2: Update Schema for Postgres

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

### Step 3: Export Local Data

Run the migration script (see `scripts/export-sqlite-data.ts`):

```bash
npm run db:export
```

This creates `prisma/data-export.json` with all your data.

### Step 4: Add Production Database URL

In Vercel Dashboard → Settings → Environment Variables:
- **Name:** `DATABASE_URL`
- **Value:** Your Postgres connection string
- **Environment:** Production (and Preview if needed)

### Step 5: Push Schema to Production

```bash
# Generate Prisma client for Postgres
npm run db:generate

# Push schema to production database
DATABASE_URL="your-production-url" npx prisma db push
```

### Step 6: Import Data to Production

Run the import script:

```bash
npm run db:import
```

Or manually import using the script (see `scripts/import-to-production.ts`).

---

## Option 2: Turso (SQLite-Compatible)

Turso is a serverless SQLite database - perfect if you want to keep SQLite!

### Step 1: Set Up Turso

1. Sign up at [turso.tech](https://turso.tech)
2. Create a new database
3. Copy the database URL and auth token

### Step 2: Update Prisma Client

Your schema can stay SQLite! Just update `src/lib/prisma.ts` to use Turso's connection.

### Step 3: Export and Import

Use the same export/import scripts, but point to Turso URL.

---

## Option 3: Neon (Serverless Postgres)

Similar to Vercel Postgres but with a larger free tier (3 GB).

1. Sign up at [neon.tech](https://neon.tech)
2. Create a database
3. Copy connection string
4. Follow same steps as Vercel Postgres

---

## Migration Scripts

### Export SQLite Data

```bash
npm run db:export
```

Exports all data from `prisma/dev.db` to `prisma/data-export.json`.

### Import to Production

```bash
npm run db:import
```

Imports data from `prisma/data-export.json` to production database.

---

## Manual Migration Steps

If you prefer to do it manually:

### 1. Export Data from SQLite

```bash
# Open SQLite database
sqlite3 prisma/dev.db

# Export to SQL
.output prisma/export.sql
.dump

# Or export to CSV
.mode csv
.output prisma/calculations.csv
SELECT * FROM Calculation;
.output prisma/journal_entries.csv
SELECT * FROM JournalEntry;
```

### 2. Import to Postgres

```bash
# Connect to Postgres
psql $DATABASE_URL

# Import SQL dump
\i prisma/export.sql
```

---

## Important Notes

⚠️ **Before migrating:**
- Backup your local database: `cp prisma/dev.db prisma/dev.db.backup`
- Test the migration on a staging/preview environment first
- Verify all data transferred correctly

✅ **After migrating:**
- Update `DATABASE_URL` environment variable in Vercel
- Test all API endpoints
- Verify calculations and journal entries work correctly

---

## Troubleshooting

### Issue: Foreign key constraints fail
**Solution:** Import tables in order: User → Calculation → JournalEntry

### Issue: Date format errors
**Solution:** SQLite and Postgres handle dates differently - the migration script handles this automatically

### Issue: Missing data
**Solution:** Check the export JSON file to verify all data was exported

---

## Quick Reference

```bash
# Export local SQLite data
npm run db:export

# Generate Prisma client
npm run db:generate

# Push schema to production
DATABASE_URL="prod-url" npx prisma db push

# Import data to production
DATABASE_URL="prod-url" npm run db:import

# Verify data
DATABASE_URL="prod-url" npx prisma studio
```
