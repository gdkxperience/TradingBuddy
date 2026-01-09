import { TrendingUp } from 'lucide-react'

interface EmptyStateProps {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="text-center text-muted-foreground py-8">
      <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
      <p>{message}</p>
    </div>
  )
}
