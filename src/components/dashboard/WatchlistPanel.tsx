'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Plus, X, Eye } from 'lucide-react'
import { SetupType } from '@/types'
import { ChangeEvent } from 'react'

interface WatchlistItem {
  id: string
  ticker: string
  setup: SetupType
  triggerPrice: number
  notes: string
}

const STORAGE_KEY = 'trading-buddy-watchlist'

export function WatchlistPanel() {
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newItem, setNewItem] = useState<Partial<WatchlistItem>>({
    ticker: '',
    setup: 'Breakout',
    triggerPrice: 0,
    notes: '',
  })

  useEffect(() => {
    loadWatchlist()
  }, [])

  const loadWatchlist = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setItems(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading watchlist:', error)
    }
  }

  const saveWatchlist = (newItems: WatchlistItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems))
      setItems(newItems)
    } catch (error) {
      console.error('Error saving watchlist:', error)
    }
  }

  const handleAdd = () => {
    if (!newItem.ticker || !newItem.setup || !newItem.triggerPrice) return

    const item: WatchlistItem = {
      id: Date.now().toString(),
      ticker: newItem.ticker.toUpperCase(),
      setup: newItem.setup as SetupType,
      triggerPrice: newItem.triggerPrice,
      notes: newItem.notes || '',
    }

    saveWatchlist([...items, item])
    setNewItem({ ticker: '', setup: 'Breakout', triggerPrice: 0, notes: '' })
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    saveWatchlist(items.filter(item => item.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Watchlist / Plan
        </CardTitle>
        <CardDescription>Your "Menu" for the day - Only trade what's on this list</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No watchlist items yet</p>
            <Button
              onClick={() => setIsAdding(true)}
              className="mt-4"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Setup
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                >
                  <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                    <div className="font-semibold">{item.ticker}</div>
                    <div className="text-sm">{item.setup}</div>
                    <div className="text-sm">€{item.triggerPrice.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">{item.notes}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {isAdding ? (
              <div className="p-4 border rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Ticker</Label>
                    <Input
                      value={newItem.ticker || ''}
                      onChange={(e) => setNewItem({ ...newItem, ticker: e.target.value })}
                      placeholder="AAPL"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Setup Type</Label>
                    <Select
                      value={newItem.setup || 'Breakout'}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewItem({ ...newItem, setup: e.target.value as SetupType })}
                      className="mt-1"
                    >
                      <option value="Breakout">Breakout</option>
                      <option value="Pullback">Pullback</option>
                      <option value="Reversal">Reversal</option>
                      <option value="Gap Fill">Gap Fill</option>
                      <option value="Trend Following">Trend Following</option>
                      <option value="Other">Other</option>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Trigger Price (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newItem.triggerPrice || ''}
                    onChange={(e) => setNewItem({ ...newItem, triggerPrice: parseFloat(e.target.value) || 0 })}
                    placeholder="85.50"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input
                    value={newItem.notes || ''}
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                    placeholder="Wait for 4H close"
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAdd} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                  <Button
                    onClick={() => {
                      setIsAdding(false)
                      setNewItem({ ticker: '', setup: 'Breakout', triggerPrice: 0, notes: '' })
                    }}
                    size="sm"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setIsAdding(true)}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Setup
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
