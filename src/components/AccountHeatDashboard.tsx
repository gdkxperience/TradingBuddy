'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { JournalEntry } from '@/types'
import { getJournalEntries } from '@/lib/journal'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Edit2, Save, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccountHeatDashboardProps {
  accountBalance: number | null
  refreshTrigger?: number
}

const MAX_HEAT_THRESHOLD = 6 // 6% threshold for disabling new trades
const CAUTION_THRESHOLD = 4 // 4% threshold for caution zone
const STORAGE_KEY = 'trading-buddy-account-balance'

export function AccountHeatDashboard({ accountBalance, refreshTrigger }: AccountHeatDashboardProps) {
  const [openPositions, setOpenPositions] = useState<JournalEntry[]>([])
  const [totalRisk, setTotalRisk] = useState(0)
  const [totalHeat, setTotalHeat] = useState<number | null>(null)
  const [excludedCount, setExcludedCount] = useState(0)
  const [manualAccountBalance, setManualAccountBalance] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)
  const [effectiveBalance, setEffectiveBalance] = useState<number | null>(null)

  // Load manual account balance from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const value = parseFloat(stored)
        if (!isNaN(value) && value > 0) {
          setManualAccountBalance(stored)
          setEffectiveBalance(value)
        }
      } else if (accountBalance && accountBalance > 0) {
        setEffectiveBalance(accountBalance)
      }
    } catch (error) {
      console.error('Error loading account balance:', error)
    }
  }, [])

  // Update effective balance when prop changes (if no manual value set)
  useEffect(() => {
    if (!manualAccountBalance && accountBalance && accountBalance > 0) {
      setEffectiveBalance(accountBalance)
    }
  }, [accountBalance, manualAccountBalance])

  useEffect(() => {
    loadOpenPositions()
    // Listen for storage changes (in case of multiple tabs)
    window.addEventListener('storage', loadOpenPositions)
    // Listen for custom refresh event
    window.addEventListener('journal-refresh', loadOpenPositions)
    return () => {
      window.removeEventListener('storage', loadOpenPositions)
      window.removeEventListener('journal-refresh', loadOpenPositions)
    }
  }, [refreshTrigger, effectiveBalance])

  const loadOpenPositions = async () => {
    try {
      const allEntries = await getJournalEntries()
      const open = allEntries.filter(entry => entry.status === 'open')
      setOpenPositions(open)

      // Calculate total risk
      const positionsWithRisk = open.filter(entry => entry.riskAmount !== null && entry.riskAmount !== undefined)
      const excluded = open.length - positionsWithRisk.length
      setExcludedCount(excluded)

      const sum = positionsWithRisk.reduce((acc, entry) => acc + (entry.riskAmount || 0), 0)
      setTotalRisk(sum)

      // Calculate total heat if account balance is available
      if (effectiveBalance && effectiveBalance > 0) {
        const heat = (sum / effectiveBalance) * 100
        setTotalHeat(heat)
      } else {
        setTotalHeat(null)
      }
    } catch (error) {
      console.error('Error loading open positions:', error)
    }
  }

  const getHeatStatus = () => {
    if (totalHeat === null) return 'unknown'
    if (totalHeat > MAX_HEAT_THRESHOLD) return 'danger'
    if (totalHeat > CAUTION_THRESHOLD) return 'caution'
    return 'safe'
  }

  const heatStatus = getHeatStatus()

  const getHeatColor = () => {
    switch (heatStatus) {
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

  const getHeatBgColor = () => {
    switch (heatStatus) {
      case 'danger':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'caution':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'safe':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      default:
        return 'bg-muted'
    }
  }

  const getHeatIcon = () => {
    switch (heatStatus) {
      case 'danger':
        return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
      case 'caution':
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      case 'safe':
        return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
      default:
        return null
    }
  }

  const getHeatMessage = () => {
    if (totalHeat === null) {
      return 'Set account size to view portfolio risk'
    }
    switch (heatStatus) {
      case 'danger':
        return `Total Heat exceeds ${MAX_HEAT_THRESHOLD}%. New trades are disabled. Close existing positions to reduce risk.`
      case 'caution':
        return `Total Heat is ${totalHeat.toFixed(2)}%. Approaching the ${MAX_HEAT_THRESHOLD}% limit.`
      case 'safe':
        return `Total Heat is ${totalHeat.toFixed(2)}%. Portfolio risk is within safe limits.`
      default:
        return ''
    }
  }

  const handleSaveAccountBalance = () => {
    const value = parseFloat(manualAccountBalance)
    if (!isNaN(value) && value > 0) {
      localStorage.setItem(STORAGE_KEY, manualAccountBalance)
      setEffectiveBalance(value)
      setIsEditing(false)
      // Dispatch custom event to notify other components (like DrawdownSimulator)
      window.dispatchEvent(new CustomEvent('account-balance-changed', {
        detail: { balance: value }
      }))
    }
  }

  const handleCancelEdit = () => {
    setManualAccountBalance(effectiveBalance?.toString() || '')
    setIsEditing(false)
  }

  const handleStartEdit = () => {
    setManualAccountBalance(effectiveBalance?.toString() || '')
    setIsEditing(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Heat Dashboard</CardTitle>
        <CardDescription>Monitor your portfolio risk across all open positions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Account Balance Input */}
        <div className="p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Account Balance</Label>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStartEdit}
                className="h-8"
              >
                <Edit2 className="h-3 w-3 mr-1" />
                {effectiveBalance ? 'Edit' : 'Set'}
              </Button>
            )}
          </div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  step="0.01"
                  value={manualAccountBalance}
                  onChange={(e) => setManualAccountBalance(e.target.value)}
                  placeholder="Enter account balance"
                  className="w-full"
                />
              </div>
              <Button
                size="sm"
                onClick={handleSaveAccountBalance}
                disabled={!manualAccountBalance || parseFloat(manualAccountBalance) <= 0}
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="text-lg font-semibold">
              {effectiveBalance ? `€${effectiveBalance.toFixed(2)}` : 'Not set'}
            </div>
          )}
        </div>

        {/* Total Heat Display */}
        <div className={cn(
          'p-4 rounded-lg border-2',
          getHeatBgColor()
        )}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getHeatIcon()}
              <span className="font-semibold">Total Heat</span>
            </div>
            <span className={cn('text-2xl font-bold', getHeatColor())}>
              {totalHeat !== null ? `${totalHeat.toFixed(2)}%` : 'N/A'}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Total Risk: €{totalRisk.toFixed(2)}
            {effectiveBalance && effectiveBalance > 0 && (
              <> / Account Balance: €{effectiveBalance.toFixed(2)}</>
            )}
          </div>
          <div className={cn('text-sm mt-2 font-medium', getHeatColor())}>
            {getHeatMessage()}
          </div>
        </div>

        {/* Open Positions List */}
        {openPositions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No open positions.</p>
            <p className="text-sm mt-1">Total Heat: 0%</p>
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-sm font-semibold mb-3">Open Positions ({openPositions.length})</h3>
              <div className="space-y-2">
                {openPositions.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{entry.ticker}</span>
                      {entry.direction === 'long' ? (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                          <TrendingUp className="h-4 w-4" />
                          Long
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm">
                          <TrendingDown className="h-4 w-4" />
                          Short
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {Math.floor(entry.positionSize)} shares
                      </span>
                    </div>
                    <div className="text-right">
                      {entry.riskAmount !== null && entry.riskAmount !== undefined ? (
                        <span className="font-medium text-red-600 dark:text-red-400">
                          -€{entry.riskAmount.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          Risk unknown
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {excludedCount > 0 && (
              <div className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                ⚠️ {excludedCount} {excludedCount === 1 ? 'trade' : 'trades'} excluded from heat calculation (no risk defined)
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Export async function to calculate total heat for use in other components
export async function calculateTotalHeat(accountBalance: number | null): Promise<{ totalHeat: number | null; isNewTradeDisabled: boolean }> {
  if (!accountBalance || accountBalance <= 0) {
    return { totalHeat: null, isNewTradeDisabled: false }
  }

  try {
    const response = await fetch(`/api/journal/heat?accountBalance=${accountBalance}`)
    if (!response.ok) {
      return { totalHeat: null, isNewTradeDisabled: false }
    }
    const data = await response.json()
    return {
      totalHeat: data.totalHeat,
      isNewTradeDisabled: data.isNewTradeDisabled || false,
    }
  } catch (error) {
    console.error('Error calculating total heat:', error)
    return { totalHeat: null, isNewTradeDisabled: false }
  }
}
