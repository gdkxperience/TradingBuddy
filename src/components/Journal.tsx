'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { JournalEntry, TradeStatus } from '@/types'
import { getJournalEntries, deleteJournalEntry, updateJournalEntryStatus } from '@/lib/journal'
import { Trash2, TrendingUp, TrendingDown, Eye, Edit } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TradePreviewModal } from './TradePreviewModal'
import { EditTradeModal } from './EditTradeModal'
import { updateJournalEntry } from '@/lib/journal'

interface JournalProps {
  refreshTrigger?: number
}

export function Journal({ refreshTrigger }: JournalProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [filter, setFilter] = useState<'all' | 'order' | 'open' | 'closed'>('all')
  const [previewEntry, setPreviewEntry] = useState<JournalEntry | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<JournalEntry | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  useEffect(() => {
    loadEntries()
    // Listen for storage changes (in case of multiple tabs)
    window.addEventListener('storage', loadEntries)
    // Listen for custom refresh event
    window.addEventListener('journal-refresh', loadEntries)
    return () => {
      window.removeEventListener('storage', loadEntries)
      window.removeEventListener('journal-refresh', loadEntries)
    }
  }, [refreshTrigger])

  const loadEntries = async () => {
    try {
      const allEntries = await getJournalEntries()
      setEntries(allEntries)
    } catch (error) {
      console.error('Error loading entries:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this trade?')) {
      try {
        await deleteJournalEntry(id)
        await loadEntries()
      } catch (error) {
        console.error('Error deleting entry:', error)
        alert('Failed to delete trade. Please try again.')
      }
    }
  }

  const handleStatusToggle = async (id: string, currentStatus: TradeStatus) => {
    // Cycle through: order -> open -> closed -> order
    const statusCycle: TradeStatus[] = ['order', 'open', 'closed']
    const currentIndex = statusCycle.indexOf(currentStatus)
    const newStatus: TradeStatus = statusCycle[(currentIndex + 1) % statusCycle.length]
    
    try {
      await updateJournalEntryStatus(id, newStatus)
      await loadEntries()
    } catch (error) {
      console.error('Error updating entry status:', error)
      alert('Failed to update trade status. Please try again.')
    }
  }

  const handlePreview = (entry: JournalEntry) => {
    setPreviewEntry(entry)
    setIsPreviewOpen(true)
  }

  const handleEdit = (entry: JournalEntry) => {
    setEditEntry(entry)
    setIsEditOpen(true)
  }

  const handleSaveEdit = async (updatedEntry: Partial<JournalEntry>) => {
    if (!editEntry) return
    try {
      await updateJournalEntry(editEntry.id, updatedEntry)
      await loadEntries()
      setIsEditOpen(false)
      setEditEntry(null)
    } catch (error) {
      console.error('Error updating entry:', error)
      throw error
    }
  }

  const filteredEntries = filter === 'all' 
    ? entries 
    : entries.filter(entry => entry.status === filter)

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const setupTypeColors: Record<string, string> = {
    'Breakout': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    'Pullback': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    'Reversal': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    'Gap Fill': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    'Trend Following': 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
    'Other': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <p>No trades saved yet.</p>
            <p className="text-sm mt-2">Calculate a position and click "Save to Journal" to get started.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Trading Journal</CardTitle>
            <CardDescription>
              {entries.length} {entries.length === 1 ? 'trade' : 'trades'} saved
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'order' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('order')}
            >
              Orders
            </Button>
            <Button
              variant={filter === 'open' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('open')}
            >
              Open
            </Button>
            <Button
              variant={filter === 'closed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('closed')}
            >
              Closed
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left p-2 text-sm font-medium text-muted-foreground">Ticker</th>
                <th className="text-left p-2 text-sm font-medium text-muted-foreground">Setup</th>
                <th className="text-left p-2 text-sm font-medium text-muted-foreground">Direction</th>
                <th className="text-right p-2 text-sm font-medium text-muted-foreground">Size</th>
                <th className="text-right p-2 text-sm font-medium text-muted-foreground">Risk</th>
                <th className="text-left p-2 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-2 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="border-b hover:bg-muted/50">
                  <td className="p-2 text-sm">{formatDate(entry.timestamp)}</td>
                  <td className="p-2">
                    <span className="font-semibold">{entry.ticker}</span>
                  </td>
                  <td className="p-2">
                    <span className={cn(
                      'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium',
                      setupTypeColors[entry.setupType] || setupTypeColors['Other']
                    )}>
                      {entry.setupType}
                    </span>
                  </td>
                  <td className="p-2">
                    {entry.direction === 'long' ? (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <TrendingUp className="h-4 w-4" />
                        Long
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                        <TrendingDown className="h-4 w-4" />
                        Short
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-right text-sm">{Math.floor(entry.positionSize)}</td>
                  <td className="p-2 text-right text-sm font-medium text-red-600 dark:text-red-400">
                    {entry.riskAmount ? `-€${entry.riskAmount.toFixed(2)}` : 'Unknown'}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleStatusToggle(entry.id, entry.status)}
                      className={cn(
                        'px-2 py-1 rounded-md text-xs font-medium transition-colors capitalize',
                        entry.status === 'order'
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800'
                          : entry.status === 'open'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                      )}
                    >
                      {entry.status}
                    </button>
                  </td>
                  <td className="p-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(entry)}
                        className="h-8 w-8 p-0"
                        title="Preview trade details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(entry)}
                        className="h-8 w-8 p-0"
                        title="Edit trade"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        title="Delete trade"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEntries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No {filter === 'all' ? '' : filter} trades found.
            </div>
          )}
        </div>
      </CardContent>

      <TradePreviewModal
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        entry={previewEntry}
      />

      <EditTradeModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        entry={editEntry}
        onSave={handleSaveEdit}
      />
    </Card>
  )
}
