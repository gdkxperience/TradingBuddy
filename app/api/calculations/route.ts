import { NextRequest, NextResponse } from 'next/server'
import { calculateForward, calculateReverse } from '@/lib/calculations'
import { ForwardCalculationInputs, ReverseCalculationInputs } from '@/types'

// Dynamic route to avoid build-time Prisma initialization
export const dynamic = 'force-dynamic'

// POST - Save a calculation
export async function POST(request: NextRequest) {
  try {
    // Lazy load Prisma to avoid build-time initialization
    const { prisma } = await import('@/lib/prisma')
    
    const body = await request.json()
    const { mode, inputs, result } = body

    if (!mode || !inputs) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Prepare data for database
    const calculationData: any = {
      mode,
      entryPrice: parseFloat(inputs.entryPrice) || 0,
      tradeType: inputs.tradeType || 'long',
    }

    if (mode === 'forward') {
      const forwardInputs = inputs as ForwardCalculationInputs
      calculationData.accountSize = forwardInputs.accountSize ? parseFloat(forwardInputs.accountSize) : null
      calculationData.riskPercentage = forwardInputs.riskPercentage ? parseFloat(forwardInputs.riskPercentage) : null
      calculationData.stopLossPrice = forwardInputs.stopLossPrice ? parseFloat(forwardInputs.stopLossPrice) : null
      calculationData.targetPrice = forwardInputs.targetPrice ? parseFloat(forwardInputs.targetPrice) : null
      calculationData.excessLiquidity = forwardInputs.excessLiquidity ? parseFloat(forwardInputs.excessLiquidity) : null
    } else {
      const reverseInputs = inputs as ReverseCalculationInputs
      calculationData.availableCash = reverseInputs.availableCash ? parseFloat(reverseInputs.availableCash) : null
      calculationData.cashUsagePercent = reverseInputs.cashUsagePercentage ? parseFloat(reverseInputs.cashUsagePercentage) : null
      calculationData.stopLossPrice = reverseInputs.stopLossPrice ? parseFloat(reverseInputs.stopLossPrice) : null
      calculationData.accountSize = reverseInputs.accountSize ? parseFloat(reverseInputs.accountSize) : null
    }

    // Add calculated results if provided
    if (result) {
      calculationData.maxLoss = result.maxLoss || null
      calculationData.riskPerShare = result.riskPerShare || null
      calculationData.maxShares = result.maxShares || null
      calculationData.tradeValue = result.tradeValue || null
      calculationData.initialMarginCost = result.initialMarginCost || null
      calculationData.rMultiple = result.rMultiple || null
      calculationData.potentialProfit = result.potentialProfit || null
      calculationData.canAfford = result.canAfford || null
    }

    const calculation = await prisma.calculation.create({
      data: calculationData,
    })

    return NextResponse.json({ 
      success: true, 
      calculation 
    })
  } catch (error) {
    console.error('Error saving calculation:', error)
    return NextResponse.json(
      { error: 'Failed to save calculation' },
      { status: 500 }
    )
  }
}

// GET - Fetch recent calculations
export async function GET(request: NextRequest) {
  try {
    // Lazy load Prisma to avoid build-time initialization
    const { prisma } = await import('@/lib/prisma')
    
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    const mode = searchParams.get('mode')

    const where = mode ? { mode } : {}

    const calculations = await prisma.calculation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ calculations })
  } catch (error) {
    console.error('Error fetching calculations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calculations' },
      { status: 500 }
    )
  }
}
