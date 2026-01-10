'use client'

import { signOut, useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserMenuProps {
  onNavigateToSettings?: () => void
}

export function UserMenu({ onNavigateToSettings }: UserMenuProps) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || !session?.user) {
    return null
  }

  const userInitials = session.user.name
    ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : session.user.email?.[0].toUpperCase() || 'U'

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
          {session.user.image ? (
            <img 
              src={session.user.image} 
              alt={session.user.name || 'User'} 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            userInitials
          )}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {session.user.name || 'User'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {session.user.email}
          </div>
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-slate-500 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 bottom-full mb-2 w-56 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 z-50">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800">
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {session.user.name || 'User'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {session.user.email}
              </div>
            </div>
            
            <div className="p-1">
              <button
                onClick={() => {
                  setIsOpen(false)
                  onNavigateToSettings?.()
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              
              <button
                onClick={async () => {
                  setIsOpen(false)
                  await signOut({ redirect: true, callbackUrl: '/' })
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
