'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CalculationResult, TradeType } from '@/types'
import { CheckCircle2, AlertCircle, TrendingUp, TrendingDown, BarChart3, Target, Shield, Brain, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TradeChecklistModalProps {
  open: boolean
  onComplete: () => void
  onCancel?: () => void
  result: CalculationResult | null
  entryPrice: number
  stopLossPrice: number | null
  targetPrice: number | null
  direction: TradeType
}

interface ChecklistItem {
  id: string
  phase: 'technical' | 'risk' | 'psychology'
  label: string
  explanation: string
  autoCheckable: boolean
  autoChecked?: boolean
}

const MIN_R_MULTIPLE = 2.0

export function TradeChecklistModal({
  open,
  onComplete,
  onCancel,
  result,
  entryPrice,
  stopLossPrice,
  targetPrice,
  direction,
}: TradeChecklistModalProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  // Auto-validate items based on calculation data
  useEffect(() => {
    if (!open || !result) {
      // Reset when modal closes
      setCheckedItems(new Set())
      return
    }

    const autoChecked = new Set<string>()

    // Auto-check R-Multiple if target price is provided and ratio is good
    if (targetPrice && result.rMultiple !== undefined && result.rMultiple >= MIN_R_MULTIPLE) {
      autoChecked.add('golden-ratio')
    }

    // Auto-check stop loss if provided (user still needs to confirm it's technical)
    if (stopLossPrice) {
      // We don't auto-check this, but we could in the future
    }

    setCheckedItems(autoChecked)
  }, [open, result, targetPrice, stopLossPrice])

  const checklistItems: ChecklistItem[] = [
    {
      id: 'trend-confirmation',
      phase: 'technical',
      label: 'Price is above EMA 25 (Long) or below EMA 25 (Short)',
      explanation: 'Keeps you from fighting the immediate trend. "The trend is your friend."',
      autoCheckable: false,
    },
    {
      id: 'support-resistance',
      phase: 'technical',
      label: 'At least 2:1 room to next major support/resistance level',
      explanation: 'Prevents buying right into a ceiling (Resistance) or shorting right into a floor (Support).',
      autoCheckable: false,
    },
    {
      id: 'volume-validation',
      phase: 'technical',
      label: 'Volume/OBV confirms the move',
      explanation: 'Filters out "fakeouts" and low-quality moves that are likely to reverse.',
      autoCheckable: false,
    },
    {
      id: 'golden-ratio',
      phase: 'risk',
      label: 'Risk:Reward ratio is at least 1:2',
      explanation: 'Mathematical survival. You can be wrong 60% of the time and still make money if you follow this rule.',
      autoCheckable: true,
      autoChecked: targetPrice !== null && targetPrice > 0 && result?.rMultiple !== undefined && result.rMultiple >= MIN_R_MULTIPLE,
    },
    {
      id: 'stop-loss-logic',
      phase: 'risk',
      label: 'Stop loss is at a technical invalidation point (not arbitrary)',
      explanation: 'Prevents "fear stops" where you exit just before the trade works.',
      autoCheckable: false,
    },
    {
      id: 'no-fomo',
      phase: 'psychology',
      label: "I'm entering because the setup is perfect, not due to emotion",
      explanation: 'Filters out emotional impulse trades, which account for 90% of large losses.',
      autoCheckable: false,
    },
    {
      id: 'event-awareness',
      phase: 'psychology',
      label: "I've checked for earnings/news/events in next 24 hours",
      explanation: 'Prevents getting gapped overnight by a binary event (like your GLUE trade during an offering).',
      autoCheckable: false,
    },
  ]

  const toggleItem = (itemId: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const allChecked = checklistItems.every(item => checkedItems.has(item.id))
  const checkedCount = checkedItems.size
  const totalCount = checklistItems.length

  const handleComplete = () => {
    if (allChecked) {
      onComplete()
    }
  }

  const phaseIcons = {
    technical: TrendingUp,
    risk: Shield,
    psychology: Brain,
  }

  const phaseLabels = {
    technical: 'Phase 1: The Setup (Technical)',
    risk: 'Phase 2: The Math (Risk)',
    psychology: 'Phase 3: The Mind (Psychology)',
  }

  const groupedItems = {
    technical: checklistItems.filter(item => item.phase === 'technical'),
    risk: checklistItems.filter(item => item.phase === 'risk'),
    psychology: checklistItems.filter(item => item.phase === 'psychology'),
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            Trade Checklist Gatekeeper
          </DialogTitle>
          <DialogDescription>
            Complete all items before viewing position size results. This acts as a digital circuit breaker for impulse trades.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className={cn(
              'font-bold',
              allChecked ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
            )}>
              {checkedCount} / {totalCount} Complete
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                allChecked 
                  ? 'bg-green-600 dark:bg-green-400' 
                  : checkedCount > 0 
                    ? 'bg-yellow-600 dark:bg-yellow-400' 
                    : 'bg-gray-300 dark:bg-gray-700'
              )}
              style={{ width: `${(checkedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Checklist Items by Phase */}
        <div className="space-y-6 py-4">
          {Object.entries(groupedItems).map(([phase, items]) => {
            const PhaseIcon = phaseIcons[phase as keyof typeof phaseIcons]
            return (
              <div key={phase} className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <PhaseIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-lg">{phaseLabels[phase as keyof typeof phaseLabels]}</h3>
                </div>
                {items.map((item) => {
                  const isChecked = checkedItems.has(item.id)
                  const isAutoChecked = item.autoChecked && item.autoCheckable
                  
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'p-4 rounded-lg border-2 transition-all cursor-pointer',
                        isChecked
                          ? 'bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-800'
                          : 'bg-muted border-border hover:border-primary/50'
                      )}
                      onClick={() => !isAutoChecked && toggleItem(item.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {isChecked ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <label
                              className={cn(
                                'font-medium cursor-pointer flex-1',
                                isChecked && 'text-green-700 dark:text-green-300'
                              )}
                            >
                              {item.label}
                            </label>
                            {isAutoChecked && (
                              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                Auto-checked
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 italic">
                            {item.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Completion Message */}
        {allChecked && (
          <div className="p-4 bg-green-50 dark:bg-green-950 border-2 border-green-300 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                ✅ All checklist items complete! You can now view your position size results.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t gap-2">
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              size="lg"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleComplete}
            disabled={!allChecked}
            size="lg"
            className={cn(
              'flex-1',
              allChecked 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gray-400 cursor-not-allowed'
            )}
          >
            {allChecked ? 'Continue to Save' : `Complete ${totalCount - checkedCount} more item${totalCount - checkedCount === 1 ? '' : 's'}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
