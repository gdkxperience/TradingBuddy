import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Lazy load Prisma to avoid build-time initialization issues
async function getPrisma() {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

// Helper function to calculate R-Multiple and potential profit
function calculateRMultipleAndProfit(
  entryPrice: number,
  stopLossPrice: number | null,
  targetPrice: number | null,
  positionSize: number,
  direction: 'long' | 'short'
): { rMultiple: number | null; potentialProfit: number | null } {
  if (!targetPrice || !stopLossPrice || !entryPrice || positionSize <= 0) {
    return { rMultiple: null, potentialProfit: null }
  }

  const risk = Math.abs(stopLossPrice - entryPrice)
  if (risk === 0) {
    return { rMultiple: null, potentialProfit: null }
  }

  // Calculate reward based on trade type
  let reward: number
  if (direction === 'long') {
    reward = targetPrice > entryPrice ? targetPrice - entryPrice : 0
  } else {
    reward = targetPrice < entryPrice ? entryPrice - targetPrice : 0
  }

  if (reward === 0) {
    return { rMultiple: null, potentialProfit: null }
  }

  const rMultiple = reward / risk
  const potentialProfit = reward * positionSize

  return { rMultiple, potentialProfit }
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

    // First, fetch the current entry to get existing values
    const currentEntry = await prisma.journalEntry.findUnique({
      where: { id },
    })

    if (!currentEntry) {
      return NextResponse.json(
        { error: 'Journal entry not found' },
        { status: 404 }
      )
    }

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
    
    // Get the values we'll use for calculation (use new values if provided, otherwise current)
    const finalEntryPrice = entryPrice !== undefined ? parseFloat(entryPrice) : currentEntry.entryPrice
    const finalStopLossPrice = stopLossPrice !== undefined 
      ? (stopLossPrice ? parseFloat(stopLossPrice) : null)
      : currentEntry.stopLossPrice
    const finalTargetPrice = targetPrice !== undefined 
      ? (targetPrice ? parseFloat(targetPrice) : null)
      : currentEntry.targetPrice
    const finalDirection = direction !== undefined && (direction === 'long' || direction === 'short')
      ? direction
      : currentEntry.direction as 'long' | 'short'
    const finalPositionSize = currentEntry.positionSize // Position size is not editable

    // Update prices if provided
    if (entryPrice !== undefined) {
      updateData.entryPrice = finalEntryPrice
    }
    if (stopLossPrice !== undefined) {
      updateData.stopLossPrice = finalStopLossPrice
    }
    if (targetPrice !== undefined) {
      updateData.targetPrice = finalTargetPrice
    }
    if (direction !== undefined && (direction === 'long' || direction === 'short')) {
      updateData.direction = finalDirection
    }
    
    // Recalculate R-Multiple and potential profit if target price, entry price, stop loss, or direction changed
    const pricesChanged = 
      entryPrice !== undefined || 
      stopLossPrice !== undefined || 
      targetPrice !== undefined || 
      direction !== undefined

    if (pricesChanged && finalTargetPrice && finalStopLossPrice && finalEntryPrice && finalPositionSize > 0) {
      const { rMultiple, potentialProfit } = calculateRMultipleAndProfit(
        finalEntryPrice,
        finalStopLossPrice,
        finalTargetPrice,
        finalPositionSize,
        finalDirection
      )
      updateData.rMultiple = rMultiple
      updateData.potentialProfit = potentialProfit
    } else if (targetPrice !== undefined && !finalTargetPrice) {
      // If target price is cleared, clear R/R and potential profit
      updateData.rMultiple = null
      updateData.potentialProfit = null
    }
    
    // Note: We intentionally do NOT allow updating these derived fields directly:
    // - positionSize (calculated from initial calculation)
    // - riskAmount (calculated from initial calculation)
    // - tradeValue (calculated from initial calculation)
    // But we DO recalculate rMultiple and potentialProfit when prices change
    
    // Allow other fields if explicitly provided (for future extensibility)
    Object.keys(otherFields).forEach(key => {
      // Skip derived fields that shouldn't be manually updated
      const protectedFields = ['positionSize', 'riskAmount', 'tradeValue']
      if (!protectedFields.includes(key) && otherFields[key] !== undefined) {
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
