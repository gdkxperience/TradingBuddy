'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, X } from 'lucide-react'

interface HeatWarningModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalHeat: number
  onProceed: () => void
  onCancel: () => void
}

export function HeatWarningModal({
  open,
  onOpenChange,
  totalHeat,
  onProceed,
  onCancel,
}: HeatWarningModalProps) {
  const handleProceed = () => {
    onProceed()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onCancel()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-2 border-red-500">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-6 w-6" />
            High Portfolio Risk Warning
          </DialogTitle>
          <DialogDescription className="pt-2">
            Your account heat exceeds the recommended threshold
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-800 dark:text-red-200">
                Current Total Heat:
              </span>
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                {totalHeat.toFixed(2)}%
              </span>
            </div>
            <div className="text-xs text-red-700 dark:text-red-300 mt-1">
              Recommended maximum: 6%
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">⚠️ Warning:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Your portfolio risk is above the recommended 6% threshold</li>
              <li>Opening additional positions increases your exposure to correlated risk</li>
              <li>Multiple "safe" trades can combine to create significant account risk</li>
            </ul>
          </div>

          <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Recommendation:</strong> Consider closing existing positions before opening new trades to reduce your total heat below 6%.
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleProceed}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            Proceed Anyway
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
