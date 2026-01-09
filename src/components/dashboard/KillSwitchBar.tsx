'use client'

import { Card } from '@/components/ui/card'
import { AlertTriangle, TrendingUp, TrendingDown, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KillSwitchBarProps {
  netLiquidationValue: number | null
  excessLiquidity: number | null
  dayPnL: number | null
  accountHeat: number | null
  accountBalance: number | null
}

export function KillSwitchBar({
  netLiquidationValue,
  excessLiquidity,
  dayPnL,
  accountHeat,
  accountBalance,
}: KillSwitchBarProps) {
  // Determine excess liquidity status
  const getExcessLiquidityStatus = () => {
    if (!excessLiquidity) return 'unknown'
    if (excessLiquidity >= 1000) return 'safe'
    if (excessLiquidity >= 500) return 'caution'
    return 'danger'
  }

  const excessLiquidityStatus = getExcessLiquidityStatus()

  // Determine if any kill switch is triggered
  const isKillSwitchActive = 
    (excessLiquidity !== null && excessLiquidity < 500) ||
    (dayPnL !== null && dayPnL < -100) ||
    (accountHeat !== null && accountHeat > 6)

  const getExcessLiquidityColor = () => {
    switch (excessLiquidityStatus) {
      case 'safe':
        return 'bg-green-500'
      case 'caution':
        return 'bg-yellow-500'
      case 'danger':
        return 'bg-red-500'
      default:
        return 'bg-gray-300'
    }
  }

  const getExcessLiquidityBg = () => {
    switch (excessLiquidityStatus) {
      case 'safe':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'caution':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'danger':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      default:
        return 'bg-muted'
    }
  }

  return (
    <Card className={cn(
      'border-2 p-4',
      isKillSwitchActive && 'border-red-500 bg-red-50 dark:bg-red-900/20'
    )}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Net Liquidation Value */}
        <div className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground">Net Liquidation Value</div>
          <div className="text-2xl font-bold">
            {netLiquidationValue !== null ? `€${netLiquidationValue.toFixed(2)}` : 'N/A'}
          </div>
        </div>

        {/* Excess Liquidity Gauge */}
        <div className={cn('p-3 rounded-lg border', getExcessLiquidityBg())}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Excess Liquidity</div>
            {excessLiquidityStatus === 'danger' && (
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
          </div>
          <div className="text-lg font-bold mb-1">
            {excessLiquidity !== null ? `€${excessLiquidity.toFixed(2)}` : 'N/A'}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={cn('h-2 rounded-full transition-all', getExcessLiquidityColor())}
              style={{
                width: excessLiquidity !== null
                  ? `${Math.min((excessLiquidity / 2000) * 100, 100)}%`
                  : '0%'
              }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {excessLiquidityStatus === 'safe' && '✓ Safe (>€1,000)'}
            {excessLiquidityStatus === 'caution' && '⚠ Caution (<€1,000)'}
            {excessLiquidityStatus === 'danger' && '🛑 Danger (<€500)'}
          </div>
        </div>

        {/* Day P&L */}
        <div className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground">Day P&L</div>
          <div className={cn(
            'text-2xl font-bold flex items-center gap-2',
            dayPnL !== null && dayPnL > 0 && 'text-green-600 dark:text-green-400',
            dayPnL !== null && dayPnL < 0 && 'text-red-600 dark:text-red-400',
            dayPnL !== null && dayPnL === 0 && 'text-muted-foreground'
          )}>
            {dayPnL !== null ? (
              <>
                {dayPnL > 0 ? (
                  <TrendingUp className="h-5 w-5" />
                ) : dayPnL < 0 ? (
                  <TrendingDown className="h-5 w-5" />
                ) : null}
                {dayPnL > 0 ? '+' : ''}€{dayPnL.toFixed(2)}
              </>
            ) : (
              'N/A'
            )}
          </div>
          {dayPnL !== null && dayPnL < -100 && (
            <div className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Tilt limit reached
            </div>
          )}
        </div>

        {/* Open Risk (Account Heat) */}
        <div className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <Shield className="h-4 w-4" />
            Open Risk (Account Heat)
          </div>
          <div className={cn(
            'text-2xl font-bold',
            accountHeat !== null && accountHeat > 6 && 'text-red-600 dark:text-red-400',
            accountHeat !== null && accountHeat > 4 && accountHeat <= 6 && 'text-yellow-600 dark:text-yellow-400',
            accountHeat !== null && accountHeat <= 4 && 'text-green-600 dark:text-green-400'
          )}>
            {accountHeat !== null ? `${accountHeat.toFixed(1)}%` : 'N/A'}
          </div>
          {accountHeat !== null && accountHeat > 6 && (
            <div className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Stop trading
            </div>
          )}
        </div>
      </div>

      {isKillSwitchActive && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200 font-semibold">
            <AlertTriangle className="h-5 w-5" />
            <span>KILL SWITCH ACTIVE - Stop trading immediately</span>
          </div>
        </div>
      )}
    </Card>
  )
}
