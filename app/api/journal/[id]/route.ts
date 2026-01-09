import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Lazy load Prisma to avoid build-time initialization issues
async function getPrisma() {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

// PATCH - Update a journal entry (status, prices, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = await getPrisma()
    const { id } = await params
    const body = await request.json()
    const { 
      status, 
      ticker, 
      setupType, 
      entryPrice, 
      stopLossPrice, 
      targetPrice, 
      direction,
      ...otherFields 
    } = body

    const updateData: any = {}
    
    // Allow updating status
    if (status && (status === 'order' || status === 'open' || status === 'closed')) {
      updateData.status = status
    }
    
    // Allow updating editable fields (not derived/calculated)
    if (ticker !== undefined) {
      updateData.ticker = ticker.toUpperCase()
    }
    if (setupType !== undefined) {
      updateData.setupType = setupType
    }
    if (entryPrice !== undefined) {
      updateData.entryPrice = parseFloat(entryPrice)
    }
    if (stopLossPrice !== undefined) {
      updateData.stopLossPrice = stopLossPrice ? parseFloat(stopLossPrice) : null
    }
    if (targetPrice !== undefined) {
      updateData.targetPrice = targetPrice ? parseFloat(targetPrice) : null
    }
    if (direction !== undefined && (direction === 'long' || direction === 'short')) {
      updateData.direction = direction
    }
    
    // Note: We intentionally do NOT allow updating derived fields:
    // - positionSize (calculated)
    // - riskAmount (calculated)
    // - tradeValue (calculated)
    // - rMultiple (calculated)
    // - potentialProfit (calculated)
    
    // Allow other fields if explicitly provided (for future extensibility)
    Object.keys(otherFields).forEach(key => {
      // Skip derived fields
      const derivedFields = ['positionSize', 'riskAmount', 'tradeValue', 'rMultiple', 'potentialProfit']
      if (!derivedFields.includes(key) && otherFields[key] !== undefined) {
        updateData[key] = otherFields[key]
      }
    })

    const entry = await prisma.journalEntry.update({
      where: { id },
      data: updateData,
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
    console.error('Error updating journal entry:', error)
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'Journal entry not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update journal entry' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a journal entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = await getPrisma()
    const { id } = await params

    await prisma.journalEntry.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting journal entry:', error)
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'Journal entry not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete journal entry' },
      { status: 500 }
    )
  }
}
