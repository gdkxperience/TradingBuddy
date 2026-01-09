import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Get database path - default to prisma/dev.db in project root
  let dbPath = './prisma/dev.db'
  
  const envUrl = process.env.DATABASE_URL
  if (envUrl && envUrl.startsWith('file:')) {
    dbPath = envUrl.replace('file:', '')
  } else if (envUrl) {
    dbPath = envUrl
  }
  
  // Resolve to absolute path
  const absoluteDbPath = path.resolve(process.cwd(), dbPath)
  
  // Create the Prisma adapter with libSQL config for local SQLite file
  const adapter = new PrismaLibSql({
    url: `file:${absoluteDbPath}`,
  })
  
  // Create PrismaClient with the adapter (Prisma 7 style)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
