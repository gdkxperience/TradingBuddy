'use client'

import { TradingDashboard } from '@/components/dashboard/TradingDashboard'
import { ForwardCalculationInputs } from '@/types'

interface TradingDashboardViewProps {
  accountBalance: number | null
  refreshTrigger: number
  forwardInputs: ForwardCalculationInputs
}

export function TradingDashboardView({
  accountBalance,
  refreshTrigger,
  forwardInputs,
}: TradingDashboardViewProps) {
  // Calculate excess liquidity from forward inputs
  const excessLiquidity = forwardInputs.excessLiquidity
    ? parseFloat(forwardInputs.excessLiquidity) || null
    : null

  return (
    <TradingDashboard
      accountBalance={accountBalance}
      excessLiquidity={excessLiquidity}
      refreshTrigger={refreshTrigger}
    />
  )
}
