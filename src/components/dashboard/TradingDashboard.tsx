'use client'

import { useState, useEffect } from 'react'
import { KillSwitchBar } from './KillSwitchBar'
import { OpenPositionsTable } from './OpenPositionsTable'
import { WatchlistPanel } from './WatchlistPanel'
import { PerformancePanel } from './PerformancePanel'
import { getJournalEntries } from '@/lib/journal'
import { calculateTotalHeat } from '../AccountHeatDashboard'

interface TradingDashboardProps {
  accountBalance: number | null
  excessLiquidity: number | null
  refreshTrigger: number
}

export function TradingDashboard({
  accountBalance,
  excessLiquidity,
  refreshTrigger,
}: TradingDashboardProps) {
  const [dayPnL, setDayPnL] = useState<number | null>(null)
  const [accountHeat, setAccountHeat] = useState<number | null>(null)
  const [netLiquidationValue, setNetLiquidationValue] = useState<number | null>(accountBalance)

  useEffect(() => {
    calculateMetrics()
  }, [accountBalance, refreshTrigger])

  const calculateMetrics = async () => {
    // Calculate account heat
    if (accountBalance) {
      const heatResult = await calculateTotalHeat(accountBalance)
      setAccountHeat(heatResult.totalHeat)
    }

    // Calculate day P&L (simplified - in real app, this would come from broker API)
    // For now, we'll calculate from open positions
    try {
      const entries = await getJournalEntries()
      const openEntries = entries.filter(e => e.status === 'open')
      // Day P&L calculation would require current prices from broker API
      // For now, set to 0 or calculate from entry prices
      setDayPnL(0) // Placeholder - would need real-time price data
    } catch (error) {
      console.error('Error calculating day P&L:', error)
    }

    // Net liquidation value = account balance (simplified)
    setNetLiquidationValue(accountBalance)
  }

  const handlePositionUpdate = () => {
    calculateMetrics()
  }

  return (
    <div className="space-y-4">
      {/* Zone 1: Kill Switch (Top Bar) */}
      <KillSwitchBar
        netLiquidationValue={netLiquidationValue}
        excessLiquidity={excessLiquidity}
        dayPnL={dayPnL}
        accountHeat={accountHeat}
        accountBalance={accountBalance}
      />

      {/* Zone 2: Open Positions */}
      <OpenPositionsTable
        refreshTrigger={refreshTrigger}
        onPositionUpdate={handlePositionUpdate}
      />

      {/* Zone 4 & 5: Watchlist and Performance Grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Zone 4: Watchlist (Left) */}
        <div className="lg:col-span-1">
          <WatchlistPanel />
        </div>

        {/* Zone 5: Performance (Right) */}
        <div className="lg:col-span-1">
          <PerformancePanel />
        </div>
      </div>
    </div>
  )
}
