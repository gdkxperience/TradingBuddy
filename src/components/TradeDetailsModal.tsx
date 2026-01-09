'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { CalculationResult, TradeType, SetupType, TradeDetails } from '@/types'
import { AlertCircle } from 'lucide-react'

interface TradeDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (details: TradeDetails) => void
  result: CalculationResult
  entryPrice: number
  stopLossPrice: number | null
  direction: TradeType
  positionSize: number
}

export function TradeDetailsModal({
  open,
  onOpenChange,
  onSave,
  result,
  entryPrice,
  stopLossPrice,
  direction,
  positionSize
}: TradeDetailsModalProps) {
  const [ticker, setTicker] = useState('')
  const [setupType, setSetupType] = useState<SetupType | ''>('')

  useEffect(() => {
    if (open) {
      setTicker('')
      setSetupType('')
    }
  }, [open])

  const handleTickerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    setTicker(value)
  }

  const handleSave = () => {
    if (ticker && setupType) {
      onSave({
        ticker,
        setupType: setupType as SetupType
      })
      onOpenChange(false)
    }
  }

  const canSave = ticker.length > 0 && setupType !== ''
  const riskAmount = result.maxLoss || null
  const hasNoRisk = stopLossPrice === null || stopLossPrice === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClick={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>Complete Trade Details</DialogTitle>
          <DialogDescription>
            Add ticker and setup type to save this trade to your journal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Pre-filled Read-only Data */}
          <div className="space-y-2 p-3 bg-muted rounded-md">
            <h4 className="text-sm font-medium mb-2">Trade Details (Read-only)</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Entry Price:</span>
                <span className="ml-2 font-medium">€{entryPrice.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Stop Loss:</span>
                <span className="ml-2 font-medium">
                  {stopLossPrice ? `€${stopLossPrice.toFixed(2)}` : 'Not set'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Position Size:</span>
                <span className="ml-2 font-medium">{Math.floor(positionSize)} shares</span>
              </div>
              <div>
                <span className="text-muted-foreground">Risk Amount:</span>
                <span className={`ml-2 font-medium ${riskAmount ? 'text-red-600 dark:text-red-400' : ''}`}>
                  {riskAmount ? `-€${riskAmount.toFixed(2)}` : 'Unknown'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Direction:</span>
                <span className="ml-2 font-medium capitalize">{direction}</span>
              </div>
            </div>
          </div>

          {hasNoRisk && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-500 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                No risk defined. Saving this trade with Risk = Unknown.
              </p>
            </div>
          )}

          {/* Required Inputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticker">
                Ticker Symbol <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ticker"
                placeholder="AAPL"
                value={ticker}
                onChange={handleTickerChange}
                maxLength={10}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canSave) {
                    handleSave()
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="setupType">
                Setup Type <span className="text-destructive">*</span>
              </Label>
              <Select
                id="setupType"
                value={setupType}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSetupType(e.target.value as SetupType)}
              >
                <option value="">Select setup type...</option>
                <option value="Breakout">Breakout</option>
                <option value="Pullback">Pullback</option>
                <option value="Reversal">Reversal</option>
                <option value="Gap Fill">Gap Fill</option>
                <option value="Trend Following">Trend Following</option>
                <option value="Other">Other</option>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!canSave}
              className="flex-1"
            >
              Save to Journal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
