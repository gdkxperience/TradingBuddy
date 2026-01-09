import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface AffordabilityAlertProps {
  canAfford: boolean
  message: string
  variant?: 'forward' | 'reverse'
}

export function AffordabilityAlert({ canAfford, message, variant = 'forward' }: AffordabilityAlertProps) {
  const colorClasses = canAfford
    ? 'bg-green-50 dark:bg-green-950 border-green-500'
    : variant === 'forward'
    ? 'bg-red-50 dark:bg-red-950 border-red-500'
    : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-500'

  const iconColorClasses = canAfford
    ? 'text-green-600 dark:text-green-400'
    : variant === 'forward'
    ? 'text-red-600 dark:text-red-400'
    : 'text-yellow-600 dark:text-yellow-400'

  return (
    <div className={`p-4 rounded-md border-2 ${colorClasses}`}>
      <div className="flex items-start gap-2">
        {canAfford ? (
          <CheckCircle2 className={`h-5 w-5 ${iconColorClasses} mt-0.5`} />
        ) : (
          <AlertCircle className={`h-5 w-5 ${iconColorClasses} mt-0.5`} />
        )}
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  )
}
