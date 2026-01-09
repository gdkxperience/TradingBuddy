import { TradeType, CalculationResult, ForwardCalculationInputs, ReverseCalculationInputs } from '@/types'

export const MARGIN_REQUIREMENTS = {
  long: 0.5,
  short: 1.0,
} as const

export const DEFAULT_RISK_PERCENTAGE = 5
export const DEFAULT_CASH_USAGE_PERCENTAGE = 50
export const MAX_RECOMMENDED_RISK_PERCENTAGE = 5
export const MIN_R_MULTIPLE = 2.0 // Minimum Risk:Reward ratio (1:2)

export function getMarginRequirement(tradeType: TradeType): number {
  return MARGIN_REQUIREMENTS[tradeType]
}

export function calculateRMultiple(
  entry: number,
  stopLoss: number,
  target: number,
  tradeType: TradeType
): { rMultiple: number; potentialProfit: number; isGoodBet: boolean; message: string } | null {
  if (!entry || !stopLoss || !target) {
    return null
  }

  const risk = Math.abs(stopLoss - entry)
  if (risk === 0) {
    return null
  }

  // Calculate reward based on trade type
  let reward: number
  if (tradeType === 'long') {
    reward = target > entry ? target - entry : 0
  } else {
    reward = target < entry ? entry - target : 0
  }

  if (reward === 0) {
    return null
  }

  const rMultiple = reward / risk
  const isGoodBet = rMultiple >= MIN_R_MULTIPLE
  const message = isGoodBet
    ? `✅ Good bet! Risk:Reward ratio is 1:${rMultiple.toFixed(2)}`
    : `❌ Bad bet. Risk:Reward ratio is 1:${rMultiple.toFixed(2)}. Find a better entry. Minimum recommended: 1:${MIN_R_MULTIPLE}`

  return {
    rMultiple,
    potentialProfit: reward,
    isGoodBet,
    message
  }
}

export function calculateForward(inputs: ForwardCalculationInputs): CalculationResult | null {
  const account = parseFloat(inputs.accountSize)
  const risk = parseFloat(inputs.riskPercentage) / 100
  const entry = parseFloat(inputs.entryPrice)
  const stopLoss = parseFloat(inputs.stopLossPrice)
  const target = parseFloat(inputs.targetPrice)
  const liquidity = parseFloat(inputs.excessLiquidity)

  if (!account || !risk || !entry || !stopLoss || !liquidity) {
    return null
  }

  // Calculate position size
  const maxLoss = account * risk
  const riskPerShare = Math.abs(stopLoss - entry)
  const maxShares = riskPerShare > 0 ? maxLoss / riskPerShare : 0
  const tradeValue = maxShares * entry

  // Calculate margin requirement
  const marginRequirement = getMarginRequirement(inputs.tradeType)
  const initialMarginCost = tradeValue * marginRequirement

  // Check affordability
  const maxAllowedMargin = liquidity / 2
  const canAfford = initialMarginCost < maxAllowedMargin
  const affordabilityMessage = canAfford
    ? `✅ You can afford this trade. Margin cost (${initialMarginCost.toFixed(2)}) is less than 50% of excess liquidity (${maxAllowedMargin.toFixed(2)})`
    : `❌ You cannot afford this trade. Margin cost (${initialMarginCost.toFixed(2)}) exceeds 50% of excess liquidity (${maxAllowedMargin.toFixed(2)})`

  // Calculate R-Multiple if target price is provided
  let rMultipleData = null
  if (target) {
    rMultipleData = calculateRMultiple(entry, stopLoss, target, inputs.tradeType)
  }

  return {
    maxLoss,
    riskPerShare,
    maxShares,
    tradeValue,
    initialMarginCost,
    canAfford,
    affordabilityMessage,
    targetPrice: target || undefined,
    potentialProfit: rMultipleData ? rMultipleData.potentialProfit * maxShares : undefined,
    rMultiple: rMultipleData?.rMultiple,
    rMultipleMessage: rMultipleData?.message,
    isGoodBet: rMultipleData?.isGoodBet
  }
}

export function calculateReverse(inputs: ReverseCalculationInputs): CalculationResult | null {
  const cash = parseFloat(inputs.availableCash)
  const usagePercent = parseFloat(inputs.cashUsagePercentage) / 100
  const entry = parseFloat(inputs.entryPrice)
  const stopLoss = parseFloat(inputs.stopLossPrice)
  const account = parseFloat(inputs.accountSize)

  if (!cash || !usagePercent || !entry) {
    return null
  }

  // Calculate usable cash
  const usableCash = cash * usagePercent

  // Calculate margin requirement
  const marginRequirement = getMarginRequirement(inputs.tradeType)

  // Calculate max trade value based on cash
  const maxTradeValue = usableCash / marginRequirement

  // Calculate max shares
  const maxShares = entry > 0 ? maxTradeValue / entry : 0

  // Calculate risk if stop loss is provided
  const riskPerShare = stopLoss ? Math.abs(stopLoss - entry) : 0
  const maxLoss = riskPerShare > 0 ? maxShares * riskPerShare : 0

  // Check if risk is acceptable (if account size and stop loss provided)
  let canAfford = true
  let affordabilityMessage = ''
  
  if (account && stopLoss) {
    const riskPercentage = account > 0 ? (maxLoss / account) * 100 : 0
    canAfford = riskPercentage <= MAX_RECOMMENDED_RISK_PERCENTAGE
    affordabilityMessage = canAfford
      ? `✅ Risk is acceptable: ${riskPercentage.toFixed(2)}% of account (max ${MAX_RECOMMENDED_RISK_PERCENTAGE}%)`
      : `⚠️ Risk is high: ${riskPercentage.toFixed(2)}% of account (max ${MAX_RECOMMENDED_RISK_PERCENTAGE}% recommended)`
  } else {
    affordabilityMessage = stopLoss 
      ? '⚠️ Enter account size to check risk percentage'
      : 'ℹ️ Enter stop loss price to calculate risk'
  }

  return {
    maxLoss,
    riskPerShare,
    maxShares,
    tradeValue: maxTradeValue,
    initialMarginCost: usableCash,
    canAfford,
    affordabilityMessage
  }
}
