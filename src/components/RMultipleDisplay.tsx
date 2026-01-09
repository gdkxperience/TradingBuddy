import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { CalculationResult } from '@/types'

interface RMultipleDisplayProps {
  result: CalculationResult
}

export function RMultipleDisplay({ result }: RMultipleDisplayProps) {
  if (!result.rMultiple || !result.targetPrice) {
    return null
  }

  const isGoodBet = result.isGoodBet ?? false
  const colorClasses = isGoodBet
    ? 'bg-green-50 dark:bg-green-950 border-green-500'
    : 'bg-red-50 dark:bg-red-950 border-red-500'

  const iconColorClasses = isGoodBet
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400'

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center p-3 bg-muted rounded-md">
        <span className="font-medium">Risk:Reward Ratio:</span>
        <span className={`text-lg font-bold ${isGoodBet ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          1:{result.rMultiple.toFixed(2)}
        </span>
      </div>

      {result.potentialProfit !== undefined && (
        <div className="flex justify-between items-center p-3 bg-muted rounded-md">
          <span className="font-medium">Potential Profit:</span>
          <span className="text-lg font-bold text-green-600 dark:text-green-400">
            €{result.potentialProfit.toFixed(2)}
          </span>
        </div>
      )}

      <div className={`p-4 rounded-md border-2 ${colorClasses}`}>
        <div className="flex items-start gap-2">
          {isGoodBet ? (
            <CheckCircle2 className={`h-5 w-5 ${iconColorClasses} mt-0.5`} />
          ) : (
            <AlertCircle className={`h-5 w-5 ${iconColorClasses} mt-0.5`} />
          )}
          <p className="text-sm font-medium">{result.rMultipleMessage}</p>
        </div>
      </div>
    </div>
  )
}
