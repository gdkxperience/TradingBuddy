'use client'

import { useState } from 'react'
import { Calculator, BarChart3, BookOpen, Menu, X, AlertTriangle, Settings, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ViewType = 'calculator' | 'dashboard' | 'trading-dashboard' | 'journal' | 'settings'

interface NavigationProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  totalHeat?: number | null
}

const navigationItems: Array<{
  id: ViewType
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  {
    id: 'calculator',
    label: 'Calculator',
    icon: Calculator,
  },
  {
    id: 'dashboard',
    label: 'Account Heat',
    icon: BarChart3,
  },
  {
    id: 'trading-dashboard',
    label: 'Trading Dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'journal',
    label: 'Journal',
    icon: BookOpen,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
  },
]

const MAX_HEAT_THRESHOLD = 6

export function Navigation({ currentView, onViewChange, totalHeat }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const showHeatWarning = totalHeat !== null && totalHeat !== undefined && totalHeat > MAX_HEAT_THRESHOLD

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Trading Buddy
          </h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              const showBadge = item.id === 'dashboard' && showHeatWarning
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {showBadge && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-3 w-3" />
                      {totalHeat?.toFixed(1)}%
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Trading Buddy
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Position Size Calculator
          </p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            const showBadge = item.id === 'dashboard' && showHeatWarning
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium flex-1 text-left">{item.label}</span>
                {showBadge && (
                  <span className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0',
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  )}>
                    <AlertTriangle className="h-3 w-3" />
                    {totalHeat?.toFixed(1)}%
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Risk Management Tool
          </p>
        </div>
      </aside>
    </>
  )
}
