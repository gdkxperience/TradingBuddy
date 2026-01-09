import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalculationResult, TradeType } from '@/types'
import { ResultItem } from './ResultItem'
import { EmptyState } from './EmptyState'
import { AffordabilityAlert } from './AffordabilityAlert'
import { RMultipleDisplay } from './RMultipleDisplay'
import { Save } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalculationResultsProps {
  result: CalculationResult | null
  title: string
  description: string
  emptyMessage: string
  variant?: 'forward' | 'reverse'
  showFields?: {
    maxLoss?: boolean
    riskPerShare?: boolean
    maxShares?: boolean
    tradeValue?: boolean
    initialMarginCost?: boolean
    usableCash?: boolean
  }
  onSaveToJournal?: () => void
  entryPrice?: number
  stopLossPrice?: number | null
  direction?: TradeType
}

export function CalculationResults({
  result,
  title,
  description,
  emptyMessage,
  variant = 'forward',
  showFields = {},
  onSaveToJournal,
  entryPrice,
  stopLossPrice,
  direction,
}: CalculationResultsProps) {
  const defaultShowFields = {
    maxLoss: true,
    riskPerShare: true,
    maxShares: true,
    tradeValue: true,
    initialMarginCost: true,
    usableCash: false,
    ...showFields
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {result ? (
          <>
            <div className="space-y-3">
              {variant === 'reverse' && defaultShowFields.usableCash && (
                <ResultItem label="Usable Cash" value={result.initialMarginCost} />
              )}
              {defaultShowFields.maxLoss && result.maxLoss > 0 && (
                <ResultItem label="Max Loss" value={result.maxLoss} />
              )}
              {defaultShowFields.riskPerShare && result.riskPerShare > 0 && (
                <ResultItem label="Risk Per Share" value={result.riskPerShare} />
              )}
              {defaultShowFields.maxShares && (
                <ResultItem 
                  label="Max Shares" 
                  value={Math.floor(result.maxShares)} 
                  highlight={variant === 'reverse'}
                  isCurrency={false}
                  decimals={0}
                />
              )}
              {defaultShowFields.tradeValue && (
                <ResultItem 
                  label={variant === 'forward' ? 'Trade Value' : 'Max Trade Value'} 
                  value={result.tradeValue} 
                  highlight={variant === 'forward'}
                />
              )}
              {defaultShowFields.initialMarginCost && variant === 'forward' && (
                <ResultItem label="Initial Margin Cost" value={result.initialMarginCost} />
              )}
            </div>
            
            <div>
              {variant === 'forward' && result.rMultiple !== undefined && (
                <RMultipleDisplay result={result} />
              )}
              
              <AffordabilityAlert 
                canAfford={result.canAfford} 
                message={result.affordabilityMessage}
                variant={variant}
              />
            </div>

            {onSaveToJournal && result.maxShares > 0 && (
              <div className="mt-4">
                <Button
                  onClick={onSaveToJournal}
                  className="w-full"
                  size="lg"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save to Journal
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState message={emptyMessage} />
        )}
      </CardContent>
    </Card>
  )
}
