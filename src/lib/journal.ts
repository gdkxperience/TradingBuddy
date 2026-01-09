import { JournalEntry, TradeStatus } from '@/types'

// API-based journal functions - all data stored in database

export async function saveTradeToJournal(entry: Omit<JournalEntry, 'id' | 'timestamp'>): Promise<JournalEntry> {
  try {
    const response = await fetch('/api/journal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticker: entry.ticker,
        setupType: entry.setupType,
        entryPrice: entry.entryPrice,
        stopLossPrice: entry.stopLossPrice,
        positionSize: entry.positionSize,
        riskAmount: entry.riskAmount,
        direction: entry.direction,
        status: entry.status || 'order',
        tradeValue: entry.tradeValue,
        rMultiple: entry.rMultiple,
        targetPrice: entry.targetPrice,
        potentialProfit: entry.potentialProfit,
      }),
    })

    if (!response.ok) {
      // Check if response is JSON before trying to parse
      const contentType = response.headers.get('content-type')
      let errorMessage = `Failed to save journal entry (${response.status})`
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If JSON parsing fails, use default message
        }
      } else {
        // Response is not JSON (likely HTML error page)
        const text = await response.text()
        console.error('Non-JSON error response:', text.substring(0, 200))
        errorMessage = `Server error: ${response.statusText || 'Unknown error'}`
      }
      
      throw new Error(errorMessage)
    }

    // Ensure response is JSON before parsing
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response')
    }

    const data = await response.json()
    
    if (!data.entry) {
      throw new Error('Invalid response format from server')
    }
    
    // Dispatch custom event to notify Journal component
    window.dispatchEvent(new Event('journal-refresh'))
    
    return data.entry
  } catch (error) {
    console.error('Error saving journal entry:', error)
    // Re-throw with a user-friendly message
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to save trade to journal. Please try again.')
  }
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  try {
    const response = await fetch('/api/journal', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      let errorMessage = `Failed to fetch journal entries (${response.status})`
      try {
        const errorData = await response.json()
        if (errorData.error) {
          errorMessage = errorData.error
        }
      } catch {
        // If response is not JSON, use status text
        errorMessage = `${errorMessage}: ${response.statusText || 'Unknown error'}`
      }
      console.error('API error:', errorMessage)
      // Return empty array instead of throwing to prevent app crashes
      return []
    }

    const data = await response.json()
    return Array.isArray(data.entries) ? data.entries : []
  } catch (error) {
    // Handle network errors, JSON parsing errors, etc.
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Error reading journal entries:', errorMessage, error)
    // Return empty array on error to prevent app crashes
    return []
  }
}

export async function deleteJournalEntry(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/journal/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete journal entry')
    }

    // Dispatch custom event to notify Journal component
    window.dispatchEvent(new Event('journal-refresh'))
  } catch (error) {
    console.error('Error deleting journal entry:', error)
    throw error
  }
}

export async function updateJournalEntryStatus(id: string, status: TradeStatus): Promise<void> {
  try {
    const response = await fetch(`/api/journal/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update journal entry')
    }

    // Dispatch custom event to notify Journal component
    window.dispatchEvent(new Event('journal-refresh'))
  } catch (error) {
    console.error('Error updating journal entry:', error)
    throw error
  }
}

export async function updateJournalEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
  try {
    const response = await fetch(`/api/journal/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update journal entry')
    }

    const data = await response.json()
    
    // Dispatch custom event to notify Journal component
    window.dispatchEvent(new Event('journal-refresh'))
    
    return data.entry
  } catch (error) {
    console.error('Error updating journal entry:', error)
    throw error
  }
}

export async function checkSimilarActiveTrade(ticker: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/journal/check?ticker=${encodeURIComponent(ticker)}`, {
      method: 'GET',
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    return data.hasSimilar || false
  } catch (error) {
    console.error('Error checking similar trade:', error)
    return false
  }
}

export async function clearJournal(): Promise<void> {
  // Note: This would require a bulk delete endpoint
  // For now, we'll fetch all entries and delete them one by one
  // In production, you might want to add a DELETE /api/journal route
  try {
    const entries = await getJournalEntries()
    await Promise.all(entries.map(entry => deleteJournalEntry(entry.id)))
  } catch (error) {
    console.error('Error clearing journal:', error)
    throw error
  }
}
