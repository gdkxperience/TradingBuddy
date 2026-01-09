import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Lazy load Prisma to avoid build-time initialization issues
async function getPrisma() {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

// GET - Calculate total heat for account
export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrisma()
    const searchParams = request.nextUrl.searchParams
    const accountBalance = searchParams.get('accountBalance')

    if (!accountBalance || parseFloat(accountBalance) <= 0) {
      return NextResponse.json({
        totalHeat: null,
        isNewTradeDisabled: false,
        totalRisk: 0,
      })
    }

    const balance = parseFloat(accountBalance)

    // Get all open positions
    const openPositions = await prisma.journalEntry.findMany({
      where: {
        status: 'open',
        riskAmount: { not: null },
      },
    })

    // Calculate total risk
    const totalRisk = openPositions.reduce(
      (sum, entry) => sum + (entry.riskAmount || 0),
      0
    )

    // Calculate total heat
    const totalHeat = (totalRisk / balance) * 100
    const MAX_HEAT_THRESHOLD = 6
    const isNewTradeDisabled = totalHeat > MAX_HEAT_THRESHOLD

    return NextResponse.json({
      totalHeat,
      isNewTradeDisabled,
      totalRisk,
      openPositionsCount: openPositions.length,
    })
  } catch (error) {
    console.error('Error calculating total heat:', error)
    return NextResponse.json(
      { error: 'Failed to calculate total heat' },
      { status: 500 }
    )
  }
}
