'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { JournalEntry, SetupType, TradeType, TradeStatus } from '@/types'
import { AlertCircle, Info } from 'lucide-react'

interface EditTradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: JournalEntry | null
  onSave: (updatedEntry: Partial<JournalEntry>) => Promise<void>
}

export function EditTradeModal({
  open,
  onOpenChange,
  entry,
  onSave,
}: EditTradeModalProps) {
  const [ticker, setTicker] = useState('')
  const [setupType, setSetupType] = useState<SetupType | ''>('')
  const [entryPrice, setEntryPrice] = useState('')
  const [stopLossPrice, setStopLossPrice] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [direction, setDirection] = useState<TradeType>('long')
  const [status, setStatus] = useState<TradeStatus>('open')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (entry && open) {
      setTicker(entry.ticker)
      setSetupType(entry.setupType)
      setEntryPrice(entry.entryPrice.toString())
      setStopLossPrice(entry.stopLossPrice?.toString() || '')
      setTargetPrice(entry.targetPrice?.toString() || '')
      setDirection(entry.direction)
      setStatus(entry.status)
    }
  }, [entry, open])

  const handleTickerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    setTicker(value)
  }

  const handleSave = async () => {
    if (!ticker || !setupType || !entryPrice) {
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        ticker,
        setupType: setupType as SetupType,
        entryPrice: parseFloat(entryPrice),
        stopLossPrice: stopLossPrice ? parseFloat(stopLossPrice) : null,
        targetPrice: targetPrice ? parseFloat(targetPrice) : null,
        direction,
        status,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving trade:', error)
      alert('Failed to update trade. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const canSave = ticker.length > 0 && setupType !== '' && entryPrice !== ''

  if (!entry) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClick={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>Edit Trade Details</DialogTitle>
          <DialogDescription>
            Update trade information. Calculated fields (position size, risk amount, etc.) cannot be edited.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info about non-editable fields */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Non-editable fields (calculated):</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Position Size: {Math.floor(entry.positionSize)} shares</li>
                <li>Risk Amount: {entry.riskAmount ? `€${entry.riskAmount.toFixed(2)}` : 'Unknown'}</li>
                {entry.tradeValue && <li>Trade Value: €{entry.tradeValue.toFixed(2)}</li>}
                {entry.rMultiple && <li>R-Multiple: 1:{entry.rMultiple.toFixed(2)}</li>}
                {entry.potentialProfit && <li>Potential Profit: €{entry.potentialProfit.toFixed(2)}</li>}
              </ul>
              <p className="mt-2 text-xs italic">
                Note: Changing prices may affect these calculations. Recalculate the position if needed.
              </p>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-ticker">
                Ticker Symbol <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-ticker"
                placeholder="AAPL"
                value={ticker}
                onChange={handleTickerChange}
                maxLength={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-setupType">
                Setup Type <span className="text-destructive">*</span>
              </Label>
              <Select
                id="edit-setupType"
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

            <div className="space-y-2">
              <Label htmlFor="edit-entryPrice">
                Entry Price <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-entryPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="100.00"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-stopLossPrice">
                Stop Loss Price
              </Label>
              <Input
                id="edit-stopLossPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="95.00"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-targetPrice">
                Target Price
              </Label>
              <Input
                id="edit-targetPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="110.00"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-direction">
                Direction <span className="text-destructive">*</span>
              </Label>
              <Select
                id="edit-direction"
                value={direction}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setDirection(e.target.value as TradeType)}
              >
                <option value="long">Long</option>
                <option value="short">Short</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                id="edit-status"
                value={status}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as TradeStatus)}
              >
                <option value="order">Order (Not Executed)</option>
                <option value="open">Open (Executed)</option>
                <option value="closed">Closed</option>
              </Select>
            </div>
          </div>

          {stopLossPrice && entryPrice && parseFloat(stopLossPrice) === parseFloat(entryPrice) && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-500 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Stop loss price equals entry price. This will result in zero risk per share.
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!canSave || isSaving}
              className="flex-1"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
