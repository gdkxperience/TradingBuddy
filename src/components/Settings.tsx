'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { getSettings, updateSettings, UserSettings, setDrawdownSimulatorEnabled } from '@/lib/settings'
import { Settings as SettingsIcon, CheckCircle2, Calculator } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Settings() {
  const [settings, setSettings] = useState<UserSettings>(getSettings())
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSettings(getSettings())
  }, [])

  const handleToggleChecklist = (enabled: boolean) => {
    const updated = updateSettings({ checklistGatekeeperEnabled: enabled })
    setSettings(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleToggleDrawdownSimulator = (enabled: boolean) => {
    setDrawdownSimulatorEnabled(enabled)
    const updated = getSettings()
    setSettings(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    // Dispatch custom event to notify DrawdownSimulator component
    window.dispatchEvent(new Event('settings-changed'))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your trading preferences and application settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trade Checklist Gatekeeper</CardTitle>
          <CardDescription>
            Enable or disable the mandatory checklist that appears before saving trades to your journal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium">Require Checklist Before Saving</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, you must complete the trade checklist before saving a trade to your journal.
                This acts as a digital circuit breaker for impulse trades.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleChecklist(true)}
                  className={cn(
                    'px-4 py-2 rounded-lg border-2 transition-all',
                    settings.checklistGatekeeperEnabled
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300'
                      : 'bg-muted border-border hover:border-primary/50'
                  )}
                >
                  Enabled
                </button>
                <button
                  onClick={() => handleToggleChecklist(false)}
                  className={cn(
                    'px-4 py-2 rounded-lg border-2 transition-all',
                    !settings.checklistGatekeeperEnabled
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300'
                      : 'bg-muted border-border hover:border-primary/50'
                  )}
                >
                  Disabled
                </button>
              </div>
              {saved && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">Saved</span>
                </div>
              )}
            </div>
          </div>

          {settings.checklistGatekeeperEnabled ? (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✓ Checklist Gatekeeper is enabled. You will be required to complete the trade checklist before saving trades.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Checklist Gatekeeper is disabled. You can save trades directly without completing the checklist.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Drawdown Simulator (What If)
          </CardTitle>
          <CardDescription>
            Enable or disable the "What If" drawdown simulator that shows worst-case scenarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium">Show Drawdown Simulator</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, the Drawdown Simulator will appear in the Account Heat Dashboard.
                It helps you visualize worst-case scenarios by showing what happens if you lose multiple trades in a row.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleDrawdownSimulator(true)}
                  className={cn(
                    'px-4 py-2 rounded-lg border-2 transition-all',
                    settings.drawdownSimulatorEnabled
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300'
                      : 'bg-muted border-border hover:border-primary/50'
                  )}
                >
                  Enabled
                </button>
                <button
                  onClick={() => handleToggleDrawdownSimulator(false)}
                  className={cn(
                    'px-4 py-2 rounded-lg border-2 transition-all',
                    !settings.drawdownSimulatorEnabled
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300'
                      : 'bg-muted border-border hover:border-primary/50'
                  )}
                >
                  Disabled
                </button>
              </div>
              {saved && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">Saved</span>
                </div>
              )}
            </div>
          </div>

          {settings.drawdownSimulatorEnabled ? (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✓ Drawdown Simulator is enabled. It will appear in the Account Heat Dashboard.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Drawdown Simulator is disabled. Enable it to see "What If" scenarios in the Account Heat Dashboard.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
