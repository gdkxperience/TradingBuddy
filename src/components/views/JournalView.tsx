'use client'

import { Journal } from '@/components/Journal'

interface JournalViewProps {
  refreshTrigger: number
}

export function JournalView({ refreshTrigger }: JournalViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Trading Journal</h2>
        <p className="text-muted-foreground">
          View and manage your saved trades
        </p>
      </div>
      
      <Journal refreshTrigger={refreshTrigger} />
    </div>
  )
}
