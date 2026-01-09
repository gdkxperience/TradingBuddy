export type TradeType = 'long' | 'short'
export type CalculationMode = 'forward' | 'reverse'

export interface CalculationResult {
  maxLoss: number
  riskPerShare: number
  maxShares: number
  tradeValue: number
  initialMarginCost: number
  canAfford: boolean
  affordabilityMessage: string
  targetPrice?: number
  potentialProfit?: number
  rMultiple?: number
  rMultipleMessage?: string
  isGoodBet?: boolean
}

export interface ForwardCalculationInputs {
  accountSize: string
  riskPercentage: string
  entryPrice: string
  stopLossPrice: string
  targetPrice: string
  tradeType: TradeType
  excessLiquidity: string
}

export interface ReverseCalculationInputs {
  availableCash: string
  cashUsagePercentage: string
  entryPrice: string
  tradeType: TradeType
  stopLossPrice: string
  accountSize: string
}

export type SetupType = 'Breakout' | 'Pullback' | 'Reversal' | 'Gap Fill' | 'Trend Following' | 'Other'
export type TradeStatus = 'order' | 'open' | 'closed'

export interface JournalEntry {
  id: string
  timestamp: string
  ticker: string
  setupType: SetupType
  entryPrice: number
  stopLossPrice: number | null
  positionSize: number
  riskAmount: number | null
  direction: TradeType
  status: TradeStatus
  tradeValue?: number
  rMultiple?: number
  targetPrice?: number
  potentialProfit?: number
}

export interface TradeDetails {
  ticker: string
  setupType: SetupType
}
