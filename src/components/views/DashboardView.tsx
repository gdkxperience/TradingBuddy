'use client'

import { AccountHeatDashboard } from '@/components/AccountHeatDashboard'
import { DrawdownSimulator } from '@/components/DrawdownSimulator'

interface DashboardViewProps {
  accountBalance: number | null
  refreshTrigger: number
}

export function DashboardView({ accountBalance, refreshTrigger }: DashboardViewProps) {
  return (
    <div className="space-y-6">
      <AccountHeatDashboard 
        accountBalance={accountBalance}
        refreshTrigger={refreshTrigger}
      />

      <DrawdownSimulator
        accountBalance={accountBalance}
        refreshTrigger={refreshTrigger}
      />
    </div>
  )
}
