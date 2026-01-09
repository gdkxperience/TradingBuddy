'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { getJournalEntries } from '@/lib/journal'
import { JournalEntry } from '@/types'
import { Brain, TrendingUp, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChangeEvent } from 'react'

type MentalState = 'Calm' | 'Anxious' | 'Greedy' | 'Focused' | 'Tilted'

const STORAGE_KEY = 'trading-buddy-mental-state'

export function PerformancePanel() {
  const [closedTrades, setClosedTrades] = useState<JournalEntry[]>([])
  const [mentalState, setMentalState] = useState<MentalState>('Calm')
  const [winRate, setWinRate] = useState<number | null>(null)
  const [avgRMultiple, setAvgRMultiple] = useState<number | null>(null)

  useEffect(() => {
    loadPerformance()
    loadMentalState()
  }, [])

  const loadPerformance = async () => {
    try {
      const allEntries = await getJournalEntries()
      const closed = allEntries.filter(entry => entry.status === 'closed')
      setClosedTrades(closed)

      // Calculate win rate (last 20 trades)
      const recentTrades = closed.slice(0, 20)
      if (recentTrades.length > 0) {
        const tradesWithRMultiple = recentTrades.filter(t => t.rMultiple !== undefined && t.rMultiple !== null)
        if (tradesWithRMultiple.length > 0) {
          const wins = tradesWithRMultiple.filter(t => (t.rMultiple || 0) > 0).length
          const rate = (wins / tradesWithRMultiple.length) * 100
          setWinRate(rate)

          // Calculate average R-Multiple
          const sum = tradesWithRMultiple.reduce((acc, t) => acc + (t.rMultiple || 0), 0)
          const avg = sum / tradesWithRMultiple.length
          setAvgRMultiple(avg)
        }
      }
    } catch (error) {
      console.error('Error loading performance:', error)
    }
  }

  const loadMentalState = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setMentalState(stored as MentalState)
      }
    } catch (error) {
      console.error('Error loading mental state:', error)
    }
  }

  const handleMentalStateChange = (value: MentalState) => {
    setMentalState(value)
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch (error) {
      console.error('Error saving mental state:', error)
    }
  }

  const getMentalStateColor = () => {
    switch (mentalState) {
      case 'Calm':
      case 'Focused':
        return 'text-green-600 dark:text-green-400'
      case 'Anxious':
      case 'Tilted':
        return 'text-red-600 dark:text-red-400'
      case 'Greedy':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Performance / Psychology
        </CardTitle>
        <CardDescription>Track your trading performance and mental state</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Win Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Win Rate (Last 20 Trades)</Label>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">
            {winRate !== null ? `${winRate.toFixed(1)}%` : 'N/A'}
          </div>
          {closedTrades.length === 0 && (
            <p className="text-xs text-muted-foreground">No closed trades yet</p>
          )}
        </div>

        {/* Average R-Multiple */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Average R-Multiple</Label>
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className={cn(
            'text-3xl font-bold',
            avgRMultiple !== null && avgRMultiple > 0 && 'text-green-600 dark:text-green-400',
            avgRMultiple !== null && avgRMultiple < 0 && 'text-red-600 dark:text-red-400'
          )}>
            {avgRMultiple !== null ? `${avgRMultiple > 0 ? '+' : ''}${avgRMultiple.toFixed(2)}R` : 'N/A'}
          </div>
          {closedTrades.length === 0 && (
            <p className="text-xs text-muted-foreground">No closed trades yet</p>
          )}
        </div>

        {/* Mental State Check */}
        <div className="space-y-2 pt-4 border-t">
          <Label className="text-sm font-medium">Mental State</Label>
          <Select 
            value={mentalState} 
            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleMentalStateChange(e.target.value as MentalState)}
          >
            <option value="Calm">Calm</option>
            <option value="Focused">Focused</option>
            <option value="Anxious">Anxious</option>
            <option value="Greedy">Greedy</option>
            <option value="Tilted">Tilted</option>
          </Select>
          <p className={cn('text-sm font-medium', getMentalStateColor())}>
            Current: {mentalState}
          </p>
          {mentalState === 'Tilted' && (
            <p className="text-xs text-red-600 dark:text-red-400">
              ⚠️ Consider taking a break
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
