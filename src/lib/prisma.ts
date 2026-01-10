import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const isProduction = process.env.NODE_ENV === 'production'
  const databaseUrl = process.env.DATABASE_URL
  const directUrl = process.env.DIRECT_DATABASE_URL
  
  // Check if we're using Prisma Accelerate (production)
  const isAccelerateUrl = databaseUrl?.startsWith('prisma+postgres://')
  
  if (isAccelerateUrl && databaseUrl) {
    // Production: Use Prisma Accelerate for connection pooling and caching
    return new PrismaClient({
      accelerateUrl: databaseUrl,
    })
  }
  
  // Development: Use PostgreSQL adapter with pg pool
  const connectionString = directUrl || databaseUrl
  
  if (!connectionString) {
    throw new Error('DATABASE_URL or DIRECT_DATABASE_URL environment variable is required')
  }
  
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  
  return new PrismaClient({
    adapter,
    log: isProduction ? ['error'] : ['query', 'error', 'warn'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
