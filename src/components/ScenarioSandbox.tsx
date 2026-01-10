'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TradeType } from '@/types'
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScenarioSandboxProps {
  entryPrice: number
  stopLossPrice: number | null
  positionSize: number // number of shares
  direction: TradeType
  tradeValue?: number
}

export function ScenarioSandbox({
  entryPrice,
  stopLossPrice,
  positionSize,
  direction,
  tradeValue,
}: ScenarioSandboxProps) {
  // Calculate slider range (20% above and below entry price, or use stop loss as min)
  const minPrice = stopLossPrice 
    ? Math.min(entryPrice * 0.8, stopLossPrice * 0.9)
    : entryPrice * 0.8
  const maxPrice = entryPrice * 1.2
  const [scenarioPrice, setScenarioPrice] = useState(entryPrice)

  // Reset to entry price when entry price changes
  useEffect(() => {
    setScenarioPrice(entryPrice)
  }, [entryPrice])

  if (!entryPrice || positionSize <= 0) {
    return null
  }

  // Calculate P&L
  const calculatePnL = (price: number): number => {
    if (direction === 'long') {
      return (price - entryPrice) * positionSize
    } else {
      // Short position: profit when price goes down
      return (entryPrice - price) * positionSize
    }
  }

  const pnl = calculatePnL(scenarioPrice)
  const isProfit = pnl > 0
  const isLoss = pnl < 0
  const isAtEntry = Math.abs(scenarioPrice - entryPrice) < 0.01

  // Calculate percentage change
  const priceChange = ((scenarioPrice - entryPrice) / entryPrice) * 100
  const priceChangeAbs = Math.abs(priceChange)

  // Generate visceral message
  const getMessage = (): { text: string; icon: React.ReactNode; color: string } => {
    if (isAtEntry) {
      return {
        text: `At entry price: $${entryPrice.toFixed(2)}. No P&L yet.`,
        icon: <AlertTriangle className="h-5 w-5" />,
        color: 'text-muted-foreground',
      }
    }

    if (isLoss) {
      const lossAmount = Math.abs(pnl)
      if (direction === 'long') {
        return {
          text: `If stock drops to $${scenarioPrice.toFixed(2)}, you lose -$${lossAmount.toFixed(2)}.`,
          icon: <TrendingDown className="h-5 w-5" />,
          color: 'text-red-600 dark:text-red-400',
        }
      } else {
        return {
          text: `If stock rises to $${scenarioPrice.toFixed(2)}, you lose -$${lossAmount.toFixed(2)}.`,
          icon: <TrendingDown className="h-5 w-5" />,
          color: 'text-red-600 dark:text-red-400',
        }
      }
    } else {
      const profitAmount = pnl
      if (direction === 'long') {
        return {
          text: `If stock gaps to $${scenarioPrice.toFixed(2)}, you make +$${profitAmount.toFixed(2)}.`,
          icon: <TrendingUp className="h-5 w-5" />,
          color: 'text-green-600 dark:text-green-400',
        }
      } else {
        return {
          text: `If stock drops to $${scenarioPrice.toFixed(2)}, you make +$${profitAmount.toFixed(2)}.`,
          icon: <TrendingUp className="h-5 w-5" />,
          color: 'text-green-600 dark:text-green-400',
        }
      }
    }
  }

  const message = getMessage()

  // Format P&L with proper sign
  const formatPnL = (value: number): string => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}$${value.toFixed(2)}`
  }

  return (
    <Card className="mt-6 border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Scenario Sandbox
        </CardTitle>
        <CardDescription>
          Drag the price slider to see live P&L impact. Make risk real before you click buy.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Price: ${scenarioPrice.toFixed(2)}</span>
            <span className={cn(
              "font-semibold",
              priceChange > 0 ? "text-green-600 dark:text-green-400" : 
              priceChange < 0 ? "text-red-600 dark:text-red-400" : 
              "text-muted-foreground"
            )}>
              {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </span>
          </div>
          
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            step={0.01}
            value={scenarioPrice}
            onChange={(e) => setScenarioPrice(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
            style={{
              background: `linear-gradient(to right, 
                ${isLoss ? '#ef4444' : '#10b981'} 0%, 
                ${isLoss ? '#ef4444' : '#10b981'} ${((scenarioPrice - minPrice) / (maxPrice - minPrice)) * 100}%, 
                #e5e7eb ${((scenarioPrice - minPrice) / (maxPrice - minPrice)) * 100}%, 
                #e5e7eb 100%)`
            }}
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>${minPrice.toFixed(2)}</span>
            <span className="font-medium">Entry: ${entryPrice.toFixed(2)}</span>
            {stopLossPrice && (
              <span className="text-red-600 dark:text-red-400">Stop: ${stopLossPrice.toFixed(2)}</span>
            )}
            <span>${maxPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* P&L Display */}
        <div className={cn(
          "p-4 rounded-lg border-2 transition-all",
          isLoss && "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900",
          isProfit && "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900",
          isAtEntry && "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {message.icon}
              <span className={cn("font-semibold text-lg", message.color)}>
                {formatPnL(pnl)}
              </span>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Position Size</div>
              <div className="font-medium">{Math.floor(positionSize)} shares</div>
            </div>
          </div>
          
          <p className={cn("mt-3 text-sm font-medium", message.color)}>
            {message.text}
          </p>

          {/* Risk Warning for Large Losses */}
          {isLoss && Math.abs(pnl) > (tradeValue || entryPrice * positionSize) * 0.1 && (
            <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-800 dark:text-red-200">
              ⚠️ This loss represents {((Math.abs(pnl) / (tradeValue || entryPrice * positionSize)) * 100).toFixed(1)}% of your trade value
            </div>
          )}
        </div>

        {/* Quick Price Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setScenarioPrice(entryPrice)}
            className="px-3 py-1 text-xs border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Entry
          </button>
          {stopLossPrice && (
            <button
              onClick={() => setScenarioPrice(stopLossPrice)}
              className="px-3 py-1 text-xs border rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400"
            >
              Stop Loss
            </button>
          )}
          <button
            onClick={() => setScenarioPrice(entryPrice * 0.95)}
            className="px-3 py-1 text-xs border rounded hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            -5%
          </button>
          <button
            onClick={() => setScenarioPrice(entryPrice * 1.05)}
            className="px-3 py-1 text-xs border rounded hover:bg-green-50 dark:hover:bg-green-950/20"
          >
            +5%
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
