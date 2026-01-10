import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Lazy load Prisma to avoid build-time initialization issues
async function getPrisma() {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

// GET - Fetch all journal entries
export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrisma()
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // 'open' | 'closed' | null for all
    const ticker = searchParams.get('ticker')

    const where: any = {}
    if (status && (status === 'open' || status === 'closed')) {
      where.status = status
    }
    if (ticker) {
      where.ticker = { contains: ticker }
    }

    const entries = await prisma.journalEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // Transform to match frontend JournalEntry type
    type JournalEntryType = typeof entries[number]
    const transformedEntries = entries.map((entry: JournalEntryType) => ({
      id: entry.id,
      timestamp: entry.createdAt.toISOString(),
      ticker: entry.ticker,
      setupType: entry.setupType,
      entryPrice: entry.entryPrice,
      stopLossPrice: entry.stopLossPrice,
      positionSize: entry.positionSize,
      riskAmount: entry.riskAmount,
      direction: entry.direction as 'long' | 'short',
      status: entry.status as 'open' | 'closed',
      tradeValue: entry.tradeValue ?? undefined,
      rMultiple: entry.rMultiple ?? undefined,
      targetPrice: entry.targetPrice ?? undefined,
      potentialProfit: entry.potentialProfit ?? undefined,
    }))

    return NextResponse.json({ entries: transformedEntries })
  } catch (error) {
    console.error('Error fetching journal entries:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch journal entries'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// POST - Create a new journal entry
export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrisma()
    const body = await request.json()
    const {
      ticker,
      setupType,
      entryPrice,
      stopLossPrice,
      positionSize,
      riskAmount,
      direction,
      status = 'order',
      tradeValue,
      rMultiple,
      targetPrice,
      potentialProfit,
      userId,
    } = body

    if (!ticker || !setupType || !entryPrice || !positionSize || !direction) {
      return NextResponse.json(
        { error: 'Missing required fields: ticker, setupType, entryPrice, positionSize, direction' },
        { status: 400 }
      )
    }

    const entry = await prisma.journalEntry.create({
      data: {
        ticker: ticker.toUpperCase(),
        setupType,
        entryPrice: parseFloat(entryPrice),
        stopLossPrice: stopLossPrice ? parseFloat(stopLossPrice) : null,
        positionSize: parseFloat(positionSize),
        riskAmount: riskAmount ? parseFloat(riskAmount) : null,
        direction,
        status,
        tradeValue: tradeValue ? parseFloat(tradeValue) : null,
        rMultiple: rMultiple ? parseFloat(rMultiple) : null,
        targetPrice: targetPrice ? parseFloat(targetPrice) : null,
        potentialProfit: potentialProfit ? parseFloat(potentialProfit) : null,
        userId: userId || null,
      },
    })

    // Transform to match frontend JournalEntry type
    const transformedEntry = {
      id: entry.id,
      timestamp: entry.createdAt.toISOString(),
      ticker: entry.ticker,
      setupType: entry.setupType,
      entryPrice: entry.entryPrice,
      stopLossPrice: entry.stopLossPrice,
      positionSize: entry.positionSize,
      riskAmount: entry.riskAmount,
      direction: entry.direction as 'long' | 'short',
      status: entry.status as 'open' | 'closed',
      tradeValue: entry.tradeValue ?? undefined,
      rMultiple: entry.rMultiple ?? undefined,
      targetPrice: entry.targetPrice ?? undefined,
      potentialProfit: entry.potentialProfit ?? undefined,
    }

    return NextResponse.json({ entry: transformedEntry })
  } catch (error) {
    console.error('Error creating journal entry:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create journal entry'
    
    // Check if it's a Prisma error
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A trade with this information already exists' },
        { status: 409 }
      )
    }
    
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { error: 'Invalid user reference' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
