'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, TrendingDown, Calculator } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getJournalEntries } from '@/lib/journal'
import { JournalEntry } from '@/types'
import { isDrawdownSimulatorEnabled } from '@/lib/settings'

interface DrawdownSimulatorProps {
  accountBalance: number | null
  refreshTrigger?: number
}

const DEFAULT_RISK_PERCENTAGE = 2 // 2% default risk per trade
const DEFAULT_CONSECUTIVE_LOSSES = 5
const SAFE_DRAWDOWN_THRESHOLD = 10 // 10% drawdown is acceptable
const CAUTION_DRAWDOWN_THRESHOLD = 20 // 20% drawdown is caution zone
const STORAGE_KEY = 'trading-buddy-account-balance'

export function DrawdownSimulator({ accountBalance, refreshTrigger }: DrawdownSimulatorProps) {
  const [isEnabled, setIsEnabled] = useState(isDrawdownSimulatorEnabled())
  const [consecutiveLosses, setConsecutiveLosses] = useState(DEFAULT_CONSECUTIVE_LOSSES)
  const [averageRiskPerTrade, setAverageRiskPerTrade] = useState<number | null>(null)
  const [recentTrades, setRecentTrades] = useState<JournalEntry[]>([])
  const [effectiveBalance, setEffectiveBalance] = useState<number | null>(null)

  // Load account balance from localStorage or use prop
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const value = parseFloat(stored)
        if (!isNaN(value) && value > 0) {
          setEffectiveBalance(value)
        } else if (accountBalance && accountBalance > 0) {
          setEffectiveBalance(accountBalance)
        }
      } else if (accountBalance && accountBalance > 0) {
        setEffectiveBalance(accountBalance)
      }
    } catch (error) {
      console.error('Error loading account balance:', error)
    }
  }, [accountBalance])

  // Listen for account balance changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const value = parseFloat(e.newValue)
        if (!isNaN(value) && value > 0) {
          setEffectiveBalance(value)
        }
      }
    }
    const handleCustomChange = (e: CustomEvent) => {
      if (e.detail?.balance) {
        setEffectiveBalance(e.detail.balance)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('account-balance-changed', handleCustomChange as EventListener)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('account-balance-changed', handleCustomChange as EventListener)
    }
  }, [])

  useEffect(() => {
    setIsEnabled(isDrawdownSimulatorEnabled())
  }, [])

  useEffect(() => {
    loadRecentTrades()
    window.addEventListener('journal-refresh', loadRecentTrades)
    return () => {
      window.removeEventListener('journal-refresh', loadRecentTrades)
    }
  }, [refreshTrigger])

  // Listen for settings changes
  useEffect(() => {
    const handleStorageChange = () => {
      setIsEnabled(isDrawdownSimulatorEnabled())
    }
    window.addEventListener('storage', handleStorageChange)
    // Also listen for custom event in case settings change in same tab
    window.addEventListener('settings-changed', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('settings-changed', handleStorageChange)
    }
  }, [])

  const loadRecentTrades = async () => {
    try {
      const entries = await getJournalEntries()
      // Get last 10 trades that have risk amounts
      const tradesWithRisk = entries
        .filter(entry => entry.riskAmount !== null && entry.riskAmount !== undefined)
        .slice(0, 10)
      setRecentTrades(tradesWithRisk)

      // Calculate average risk per trade
      if (tradesWithRisk.length > 0) {
        const totalRisk = tradesWithRisk.reduce((sum, entry) => sum + (entry.riskAmount || 0), 0)
        const average = totalRisk / tradesWithRisk.length
        setAverageRiskPerTrade(average)
      } else {
        setAverageRiskPerTrade(null)
      }
    } catch (error) {
      console.error('Error loading recent trades:', error)
    }
  }

  // Calculate risk per trade
  const getRiskPerTrade = (): number => {
    if (averageRiskPerTrade !== null) {
      return averageRiskPerTrade
    }
    // Use default percentage of account balance
    if (effectiveBalance && effectiveBalance > 0) {
      return (effectiveBalance * DEFAULT_RISK_PERCENTAGE) / 100
    }
    return 0
  }

  // Calculate drawdown
  const calculateDrawdown = () => {
    if (!effectiveBalance || effectiveBalance <= 0) {
      return null
    }

    const riskPerTrade = getRiskPerTrade()
    const totalLoss = riskPerTrade * consecutiveLosses
    const remainingBalance = effectiveBalance - totalLoss
    const drawdownAmount = totalLoss
    const drawdownPercentage = (drawdownAmount / effectiveBalance) * 100

    return {
      startingBalance: effectiveBalance,
      remainingBalance: Math.max(0, remainingBalance),
      drawdownAmount,
      drawdownPercentage,
      riskPerTrade,
    }
  }

  const drawdown = calculateDrawdown()

  const getDrawdownStatus = () => {
    if (!drawdown) return 'unknown'
    if (drawdown.drawdownPercentage > CAUTION_DRAWDOWN_THRESHOLD) return 'danger'
    if (drawdown.drawdownPercentage > SAFE_DRAWDOWN_THRESHOLD) return 'caution'
    return 'safe'
  }

  const status = getDrawdownStatus()

  const getStatusColor = () => {
    switch (status) {
      case 'danger':
        return 'text-red-600 dark:text-red-400'
      case 'caution':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'safe':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-muted-foreground'
    }
  }

  const getStatusBgColor = () => {
    switch (status) {
      case 'danger':
        return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
      case 'caution':
        return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
      case 'safe':
        return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
      default:
        return 'bg-muted'
    }
  }

  const getStatusMessage = () => {
    if (!drawdown) return ''
    switch (status) {
      case 'danger':
        return '⚠️ Too aggressive! Reduce your risk per trade. Losing 5 trades in a row would significantly impact your account.'
      case 'caution':
        return '⚠️ Caution: Consider reducing position sizes. This drawdown level may be uncomfortable.'
      case 'safe':
        return '✅ Acceptable risk level. Your account can handle this drawdown scenario.'
      default:
        return ''
    }
  }

  // Don't render if disabled in settings
  if (!isEnabled) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Drawdown Simulator
            </CardTitle>
            <CardDescription>
              {effectiveBalance && effectiveBalance > 0
                ? `What if I lose my next ${consecutiveLosses} trades in a row?`
                : 'Set account size to use drawdown simulator'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration */}
        <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
          <label className="text-sm font-medium">
            Number of consecutive losses:
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={consecutiveLosses}
            onChange={(e) => setConsecutiveLosses(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
            className="w-20 px-2 py-1 border rounded-md text-sm"
          />
        </div>

        {/* Risk Calculation Info */}
        {effectiveBalance && effectiveBalance > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm">
              <span className="font-medium">Risk per trade: </span>
              <span className="font-bold">€{drawdown?.riskPerTrade?.toFixed(2) || getRiskPerTrade().toFixed(2)}</span>
              {averageRiskPerTrade !== null ? (
                <span className="text-muted-foreground ml-2">
                  (Average from {recentTrades.length} recent {recentTrades.length === 1 ? 'trade' : 'trades'})
                </span>
              ) : (
                <span className="text-muted-foreground ml-2">
                  (Default {DEFAULT_RISK_PERCENTAGE}% of account)
                </span>
              )}
            </div>
          </div>
        )}

        {(!effectiveBalance || effectiveBalance <= 0) && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Please set your account size in the Account Heat Dashboard to use the drawdown simulator.
              </p>
            </div>
          </div>
        )}

        {/* Drawdown Calculation */}
        {drawdown && drawdown.startingBalance != null && (
          <div className={cn('p-4 rounded-lg border-2', getStatusBgColor())}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Starting Balance:</span>
                <span className="text-lg font-bold">€{drawdown.startingBalance?.toFixed(2) || '0.00'}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm">After {consecutiveLosses} consecutive losses:</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Remaining Balance:</span>
                <span className={cn('text-2xl font-bold', getStatusColor())}>
                  €{drawdown.remainingBalance?.toFixed(2) || '0.00'}
                </span>
              </div>

              <div className="pt-2 border-t border-current/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Total Drawdown:</span>
                  <span className={cn('text-lg font-bold', getStatusColor())}>
                    -€{drawdown.drawdownAmount?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Drawdown Percentage:</span>
                  <span className={cn('text-lg font-bold', getStatusColor())}>
                    {drawdown.drawdownPercentage?.toFixed(1) || '0.0'}%
                  </span>
                </div>
              </div>

              {status !== 'safe' && (
                <div className="pt-2 border-t border-current/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={cn('h-5 w-5 mt-0.5', getStatusColor())} />
                    <p className={cn('text-sm font-medium', getStatusColor())}>
                      {getStatusMessage()}
                    </p>
                  </div>
                </div>
              )}

              {status === 'safe' && (
                <div className="pt-2 border-t border-current/20">
                  <p className={cn('text-sm font-medium', getStatusColor())}>
                    {getStatusMessage()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Example Impact */}
        {drawdown && drawdown.startingBalance != null && drawdown.remainingBalance != null && drawdown.remainingBalance > 0 && (
          <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
            <p>
              <strong>Example:</strong> If your account is €{drawdown.startingBalance.toFixed(2)} and you lose {consecutiveLosses} trades in a row at €{drawdown.riskPerTrade?.toFixed(2) || '0.00'} each, 
              you'll have €{drawdown.remainingBalance.toFixed(2)} remaining ({drawdown.drawdownPercentage?.toFixed(1) || '0.0'}% drawdown).
            </p>
          </div>
        )}

        {drawdown && drawdown.remainingBalance != null && drawdown.remainingBalance <= 0 && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                ⚠️ Risk per trade is too high for your account size. Losing {consecutiveLosses} trades would wipe out your account. 
                Reduce your position sizes immediately.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
