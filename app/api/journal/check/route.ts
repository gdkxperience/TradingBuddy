import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Lazy load Prisma to avoid build-time initialization issues
async function getPrisma() {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

// GET - Check if similar active trade exists
export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrisma()
    const searchParams = request.nextUrl.searchParams
    const ticker = searchParams.get('ticker')

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker parameter is required' },
        { status: 400 }
      )
    }

    const existingTrade = await prisma.journalEntry.findFirst({
      where: {
        ticker: ticker.toUpperCase(),
        status: 'open',
      },
    })

    return NextResponse.json({ 
      hasSimilar: !!existingTrade,
      exists: !!existingTrade 
    })
  } catch (error) {
    console.error('Error checking similar trade:', error)
    return NextResponse.json(
      { error: 'Failed to check similar trade' },
      { status: 500 }
    )
  }
}
