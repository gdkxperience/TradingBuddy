'use client'

import { useEffect } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'warning' | 'error'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: CheckCircle2,
    warning: AlertCircle,
    error: AlertCircle,
  }

  const styles = {
    success: 'bg-green-50 dark:bg-green-950 border-green-500 text-green-800 dark:text-green-200',
    warning: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-500 text-yellow-800 dark:text-yellow-200',
    error: 'bg-red-50 dark:bg-red-950 border-red-500 text-red-800 dark:text-red-200',
  }

  const Icon = icons[type]

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <div
        className={cn(
          'flex items-center gap-3 p-4 rounded-lg border-2 shadow-lg min-w-[300px] max-w-md',
          styles[type]
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
