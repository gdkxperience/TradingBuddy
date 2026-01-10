'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { AuthModal } from './AuthModal'
import { 
  Calculator, 
  TrendingUp, 
  Shield, 
  Target, 
  BarChart3, 
  Zap, 
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  PlayCircle,
  Star,
  Users,
  Brain,
  Gauge
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [activeFeature, setActiveFeature] = useState(0)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { data: session, status } = useSession()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Only check session after mount to avoid hydration mismatch
  const isAuthenticated = isMounted && status !== 'loading' && !!session

  const features = [
    {
      icon: Calculator,
      title: 'Position Size Calculator',
      description: 'Calculate optimal position sizes with Forward and Reverse modes. Know exactly how many shares to buy before you click.',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: Target,
      title: 'R-Multiple Simulator',
      description: 'Visualize Risk:Reward ratios in real-time. See if your trade meets the golden 1:2 ratio before entering.',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      icon: Zap,
      title: 'Scenario Sandbox',
      description: 'Drag the price slider to see live P&L impact. Make risk visceral before you commit capital.',
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: Shield,
      title: 'Account Heat Dashboard',
      description: 'Prevent portfolio blowups. See total risk across all positions and get protected from over-leveraging.',
      color: 'text-red-600 dark:text-red-400'
    },
    {
      icon: Brain,
      title: 'Trade Checklist Gatekeeper',
      description: '7-point checklist prevents impulse trades. Technical, risk, and psychology checks before you save.',
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      icon: BarChart3,
      title: 'Trading Dashboard',
      description: 'Complete cockpit view: Kill switch bar, open positions, watchlist, and performance tracking.',
      color: 'text-indigo-600 dark:text-indigo-400'
    }
  ]

  const benefits = [
    {
      title: 'Stop Blowing Up Accounts',
      description: 'Account Heat Dashboard prevents the #1 mistake: opening 10 "safe" trades that correlate and destroy your account.',
      icon: AlertTriangle
    },
    {
      title: 'Make Risk Real',
      description: 'Scenario Sandbox shows you the red number before you click buy. Visceralize losses to prevent emotional trading.',
      icon: Brain
    },
    {
      title: 'Follow the Math',
      description: 'R-Multiple calculator ensures you only take trades with 1:2+ risk:reward. Survive 60% loss rate and still profit.',
      icon: Target
    },
    {
      title: 'Prevent Impulse Trades',
      description: 'Trade Checklist Gatekeeper forces you through 7 checks before saving. Filters out 90% of emotional trades.',
      icon: Shield
    }
  ]

  const stats = [
    { value: '1:2+', label: 'Minimum R-Multiple', icon: Target },
    { value: '6%', label: 'Max Account Heat', icon: Gauge },
    { value: '7', label: 'Checklist Items', icon: CheckCircle2 },
    { value: '100%', label: 'Free Forever', icon: Star }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
              <Star className="h-4 w-4 fill-blue-600 dark:fill-blue-400" />
              <span>Free Position Size Calculator for Traders</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Stop Blowing Up Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Trading Account
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Calculate position sizes, visualize risk, and prevent portfolio blowups. 
              The only tool that makes risk <span className="font-semibold text-foreground">real</span> before you click buy.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {isAuthenticated ? (
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 h-auto group"
                  onClick={onGetStarted}
                >
                  Start Calculating Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-6 h-auto group"
                    onClick={() => setShowAuthModal(true)}
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="text-lg px-8 py-6 h-auto"
                    onClick={() => {
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    <PlayCircle className="mr-2 h-5 w-5" />
                    See How It Works
                  </Button>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span>No Sign Up Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span>100% Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span>Works Offline</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <stat.icon className="h-8 w-8 mx-auto text-blue-600 dark:text-blue-400" />
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              Everything You Need to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Trade Smarter
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stop guessing position sizes. Start calculating with precision.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className={cn(
                    "p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer group",
                    activeFeature === index
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-lg scale-105"
                      : "border-border hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md"
                  )}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className={cn("mb-4 p-3 rounded-lg w-fit bg-muted", feature.color)}>
                    <Icon className={cn("h-6 w-6", feature.color)} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              Why Traders Choose
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                Trading Buddy
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built by traders, for traders. Every feature prevents a common mistake.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div
                  key={index}
                  className="p-8 rounded-xl bg-background border-2 border-border hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{benefit.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to better position sizing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Calculate Position Size',
                description: 'Enter your account size, risk percentage, entry price, and stop loss. Get instant position size calculation.',
                icon: Calculator
              },
              {
                step: '2',
                title: 'Visualize Risk',
                description: 'Use Scenario Sandbox to drag price and see P&L impact. Make risk real before you commit.',
                icon: Zap
              },
              {
                step: '3',
                title: 'Save & Track',
                description: 'Save to journal, track performance, and monitor account heat. Never over-leverage again.',
                icon: BarChart3
              }
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="relative">
                  <div className="p-8 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-border">
                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold text-xl">
                      {item.step}
                    </div>
                    <div className="mb-4 p-3 rounded-lg w-fit bg-background">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to Trade Smarter?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Start calculating position sizes in seconds. No sign up, no credit card, no BS.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-6 h-auto group"
            onClick={onGetStarted}
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-sm opacity-75">
            ✓ 100% Free • ✓ No Sign Up Required • ✓ Works Offline
          </p>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        defaultTab="register"
      />

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-6 w-6" />
              <span className="font-semibold">Trading Buddy</span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-right">
              Built for traders who want to survive and thrive. Free forever.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
