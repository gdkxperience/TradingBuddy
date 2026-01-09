'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { JournalEntry } from '@/types'
import { getJournalEntries, updateJournalEntryStatus } from '@/lib/journal'
import { TrendingUp, TrendingDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OpenPositionsTableProps {
  refreshTrigger?: number
  onPositionUpdate?: () => void
}

export function OpenPositionsTable({ refreshTrigger, onPositionUpdate }: OpenPositionsTableProps) {
  const [positions, setPositions] = useState<JournalEntry[]>([])
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({})

  useEffect(() => {
    loadPositions()
    window.addEventListener('journal-refresh', loadPositions)
    return () => {
      window.removeEventListener('journal-refresh', loadPositions)
    }
  }, [refreshTrigger])

  const loadPositions = async () => {
    try {
      const allEntries = await getJournalEntries()
      const open = allEntries.filter(entry => entry.status === 'open')
      setPositions(open)
      
      // Initialize current prices with entry prices
      const prices: Record<string, number> = {}
      open.forEach(entry => {
        if (!currentPrices[entry.id]) {
          prices[entry.id] = entry.entryPrice
        } else {
          prices[entry.id] = currentPrices[entry.id]
        }
      })
      setCurrentPrices(prices)
    } catch (error) {
      console.error('Error loading positions:', error)
    }
  }

  const calculatePnL = (entry: JournalEntry, currentPrice: number): number => {
    const priceDiff = currentPrice - entry.entryPrice
    if (entry.direction === 'long') {
      return priceDiff * entry.positionSize
    } else {
      return -priceDiff * entry.positionSize
    }
  }

  const calculateRMultiple = (entry: JournalEntry, currentPrice: number): number | null => {
    if (!entry.riskAmount || entry.riskAmount === 0) return null
    
    const pnl = calculatePnL(entry, currentPrice)
    return pnl / entry.riskAmount
  }

  const handleClosePosition = async (entryId: string) => {
    try {
      await updateJournalEntryStatus(entryId, 'closed')
      await loadPositions()
      onPositionUpdate?.()
    } catch (error) {
      console.error('Error closing position:', error)
    }
  }

  const handlePriceUpdate = (entryId: string, newPrice: number) => {
    setCurrentPrices(prev => ({
      ...prev,
      [entryId]: newPrice
    }))
  }

  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Open Positions</CardTitle>
          <CardDescription>The "Active Battle" - Your current holdings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No open positions</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Open Positions</CardTitle>
        <CardDescription>The "Active Battle" - Your current holdings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-semibold">Ticker</th>
                <th className="text-left p-2 font-semibold">Side</th>
                <th className="text-right p-2 font-semibold">Size</th>
                <th className="text-right p-2 font-semibold">Entry</th>
                <th className="text-right p-2 font-semibold">Current</th>
                <th className="text-right p-2 font-semibold">P&L</th>
                <th className="text-right p-2 font-semibold">R-Multiple</th>
                <th className="text-center p-2 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((entry) => {
                const currentPrice = currentPrices[entry.id] || entry.entryPrice
                const pnl = calculatePnL(entry, currentPrice)
                const rMultiple = calculateRMultiple(entry, currentPrice)

                return (
                  <tr key={entry.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <span className="font-semibold">{entry.ticker}</span>
                    </td>
                    <td className="p-2">
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
                    </td>
                    <td className="p-2 text-right">{Math.floor(entry.positionSize)}</td>
                    <td className="p-2 text-right">€{entry.entryPrice.toFixed(2)}</td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        value={currentPrice.toFixed(2)}
                        onChange={(e) => handlePriceUpdate(entry.id, parseFloat(e.target.value) || entry.entryPrice)}
                        className="w-20 text-right border rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className={cn(
                      'p-2 text-right font-medium',
                      pnl > 0 && 'text-green-600 dark:text-green-400',
                      pnl < 0 && 'text-red-600 dark:text-red-400'
                    )}>
                      {pnl > 0 ? '+' : ''}€{pnl.toFixed(2)}
                    </td>
                    <td className={cn(
                      'p-2 text-right font-medium',
                      rMultiple !== null && rMultiple > 0 && 'text-green-600 dark:text-green-400',
                      rMultiple !== null && rMultiple < 0 && 'text-red-600 dark:text-red-400'
                    )}>
                      {rMultiple !== null ? (
                        <span>{rMultiple > 0 ? '+' : ''}{rMultiple.toFixed(1)}R</span>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleClosePosition(entry.id)}
                        className="h-8"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Close
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
