'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { JournalEntry } from '@/types'
import { TrendingUp, TrendingDown, Calendar, DollarSign, AlertTriangle, Target, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TradePreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: JournalEntry | null
}

export function TradePreviewModal({ open, onOpenChange, entry }: TradePreviewModalProps) {
  if (!entry) return null

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const setupTypeColors: Record<string, string> = {
    'Breakout': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    'Pullback': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    'Reversal': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    'Gap Fill': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    'Trend Following': 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
    'Other': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClick={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl font-bold">{entry.ticker}</span>
            <span className={cn(
              'inline-flex items-center px-3 py-1 rounded-md text-sm font-medium',
              setupTypeColors[entry.setupType] || setupTypeColors['Other']
            )}>
              {entry.setupType}
            </span>
          </DialogTitle>
          <DialogDescription>
            Trade details and calculation information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trade Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                Date & Time
              </div>
              <p className="font-medium">{formatDate(entry.timestamp)}</p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                {entry.direction === 'long' ? (
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
                Direction
              </div>
              <p className="font-medium capitalize">{entry.direction}</p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <BarChart3 className="h-4 w-4" />
                Status
              </div>
              <span className={cn(
                'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium capitalize',
                entry.status === 'order'
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  : entry.status === 'open'
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
              )}>
                {entry.status === 'order' ? 'Order (Not Executed)' : entry.status === 'open' ? 'Open (Executed)' : 'Closed'}
              </span>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                Position Size
              </div>
              <p className="font-medium">{Math.floor(entry.positionSize)} shares</p>
            </div>
          </div>

          {/* Price Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Price Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Entry Price</div>
                <p className="text-xl font-bold">€{entry.entryPrice.toFixed(2)}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Stop Loss</div>
                <p className="text-xl font-bold">
                  {entry.stopLossPrice ? `€${entry.stopLossPrice.toFixed(2)}` : 'Not set'}
                </p>
              </div>
              {entry.targetPrice && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Target className="h-4 w-4" />
                    Target Price
                  </div>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    €{entry.targetPrice.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Risk & Reward */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Risk & Reward Analysis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border-2 border-red-200 dark:border-red-900 rounded-lg bg-red-50 dark:bg-red-950">
                <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300 mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  Risk Amount
                </div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {entry.riskAmount ? `-€${entry.riskAmount.toFixed(2)}` : 'Unknown'}
                </p>
              </div>

              {entry.tradeValue && (
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Trade Value</div>
                  <p className="text-2xl font-bold">€{entry.tradeValue.toFixed(2)}</p>
                </div>
              )}

              {entry.rMultiple && (
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Risk:Reward Ratio</div>
                  <p className={cn(
                    "text-2xl font-bold",
                    entry.rMultiple >= 2 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}>
                    1:{entry.rMultiple.toFixed(2)}
                  </p>
                  {entry.rMultiple < 2 && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Below recommended 1:2 ratio
                    </p>
                  )}
                </div>
              )}

              {entry.potentialProfit && (
                <div className="p-4 border-2 border-green-200 dark:border-green-900 rounded-lg bg-green-50 dark:bg-green-950">
                  <div className="text-sm text-green-700 dark:text-green-300 mb-1">Potential Profit</div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    +€{entry.potentialProfit.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Risk Per Share */}
          {entry.stopLossPrice && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Risk Per Share</div>
              <p className="text-lg font-medium">
                €{Math.abs(entry.stopLossPrice - entry.entryPrice).toFixed(2)}
              </p>
            </div>
          )}

          {/* Additional Notes Section (for future expansion) */}
          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Trade ID: <span className="font-mono text-xs">{entry.id}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
