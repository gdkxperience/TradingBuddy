'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AuthModal } from './AuthModal'
import { 
  Calculator, 
  Cloud, 
  Smartphone, 
  Shield, 
  Sparkles,
  ArrowRight,
  User
} from 'lucide-react'

interface WelcomeModalProps {
  open: boolean
  onSkip: () => void
}

export function WelcomeModal({ open, onSkip }: WelcomeModalProps) {
  const [showAuthModal, setShowAuthModal] = useState(false)

  const benefits = [
    {
      icon: Cloud,
      title: 'Sync Your Data',
      description: 'Access your trades and settings from any device'
    },
    {
      icon: Smartphone,
      title: 'Never Lose Progress',
      description: 'Your journal entries and calculations are safely stored'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your trading data is encrypted and protected'
    }
  ]

  return (
    <>
      <Dialog open={open && !showAuthModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 shadow-2xl">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 px-8 pt-10 pb-8 text-white">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTZzLTItNC0yLTYgMi00IDItNi0yLTQtMi02IDItNCAyLTYtMi00LTItNmgydjZjMCAyIDIgNCAyIDZzLTIgNC0yIDYgMiA0IDIgNi0yIDQtMiA2IDIgNCAyIDYtMiA0LTIgNmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Calculator className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Welcome to Trading Buddy</h2>
                  <p className="text-blue-100 text-sm">Your position sizing companion</p>
                </div>
              </div>
              
              <p className="text-blue-50 leading-relaxed">
                Start calculating right away — <span className="font-semibold text-white">no account required</span>. 
                Create a free account anytime to save your data across devices.
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="px-8 py-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Benefits of creating an account</span>
            </div>
            
            <div className="space-y-3">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
                  >
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white flex-shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{benefit.title}</h3>
                      <p className="text-xs text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 pb-8 space-y-3">
            <Button 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25"
              onClick={() => setShowAuthModal(true)}
            >
              <User className="mr-2 h-5 w-5" />
              Create Free Account
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full h-11 text-muted-foreground hover:text-foreground group"
              onClick={onSkip}
            >
              Continue without account
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="text-xs text-center text-muted-foreground pt-2">
              You can create an account anytime from the sidebar
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={(open) => {
          setShowAuthModal(open)
          if (!open) {
            // If auth modal is closed after successful registration, 
            // the page will be redirected, so we don't need to do anything
          }
        }}
        defaultTab="register"
        redirectTo="/app"
      />
    </>
  )
}
