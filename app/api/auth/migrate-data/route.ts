import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { id: userId } = await requireAuth()
    
    // Find all anonymous entries (userId = null) and migrate them
    const [journalEntriesMigrated, calculationsMigrated] = await Promise.all([
      prisma.journalEntry.updateMany({
        where: { userId: null },
        data: { userId }
      }),
      prisma.calculation.updateMany({
        where: { userId: null },
        data: { userId }
      })
    ])

    return NextResponse.json({
      migrated: {
        journalEntries: journalEntriesMigrated.count,
        calculations: calculationsMigrated.count
      },
      message: 'Data migrated successfully'
    })
  } catch (error) {
    console.error('Migration error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'You must be logged in to migrate data' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to migrate data' },
      { status: 500 }
    )
  }
}
