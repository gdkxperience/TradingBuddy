import { useState, ChangeEvent } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Calculator, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'

type TradeType = 'long' | 'short'

interface CalculationResult {
  maxLoss: number
  riskPerShare: number
  maxShares: number
  tradeValue: number
  initialMarginCost: number
  canAfford: boolean
  affordabilityMessage: string
}

function App() {
  const [mode, setMode] = useState<'forward' | 'reverse'>('forward')
  
  // Forward calculation inputs
  const [accountSize, setAccountSize] = useState<string>('')
  const [riskPercentage, setRiskPercentage] = useState<string>('5')
  const [entryPrice, setEntryPrice] = useState<string>('')
  const [stopLossPrice, setStopLossPrice] = useState<string>('')
  const [tradeType, setTradeType] = useState<TradeType>('long')
  const [excessLiquidity, setExcessLiquidity] = useState<string>('')
  
  // Reverse calculation inputs
  const [availableCash, setAvailableCash] = useState<string>('')
  const [cashUsagePercentage, setCashUsagePercentage] = useState<string>('50')
  const [reverseEntryPrice, setReverseEntryPrice] = useState<string>('')
  const [reverseTradeType, setReverseTradeType] = useState<TradeType>('long')
  const [reverseStopLossPrice, setReverseStopLossPrice] = useState<string>('')
  const [reverseAccountSize, setReverseAccountSize] = useState<string>('')

  const calculateForward = (): CalculationResult | null => {
    const account = parseFloat(accountSize)
    const risk = parseFloat(riskPercentage) / 100
    const entry = parseFloat(entryPrice)
    const stopLoss = parseFloat(stopLossPrice)
    const liquidity = parseFloat(excessLiquidity)

    if (!account || !risk || !entry || !stopLoss || !liquidity) {
      return null
    }

    // Calculate position size
    const maxLoss = account * risk
    const riskPerShare = Math.abs(stopLoss - entry)
    const maxShares = riskPerShare > 0 ? maxLoss / riskPerShare : 0
    const tradeValue = maxShares * entry

    // Calculate margin requirement
    const marginRequirement = tradeType === 'long' ? 0.5 : 1.0
    const initialMarginCost = tradeValue * marginRequirement

    // Check affordability
    const maxAllowedMargin = liquidity / 2
    const canAfford = initialMarginCost < maxAllowedMargin
    const affordabilityMessage = canAfford
      ? `✅ You can afford this trade. Margin cost (${initialMarginCost.toFixed(2)}) is less than 50% of excess liquidity (${maxAllowedMargin.toFixed(2)})`
      : `❌ You cannot afford this trade. Margin cost (${initialMarginCost.toFixed(2)}) exceeds 50% of excess liquidity (${maxAllowedMargin.toFixed(2)})`

    return {
      maxLoss,
      riskPerShare,
      maxShares,
      tradeValue,
      initialMarginCost,
      canAfford,
      affordabilityMessage
    }
  }

  const calculateReverse = (): CalculationResult | null => {
    const cash = parseFloat(availableCash)
    const usagePercent = parseFloat(cashUsagePercentage) / 100
    const entry = parseFloat(reverseEntryPrice)
    const stopLoss = parseFloat(reverseStopLossPrice)
    const account = parseFloat(reverseAccountSize)

    if (!cash || !usagePercent || !entry) {
      return null
    }

    // Calculate usable cash
    const usableCash = cash * usagePercent

    // Calculate margin requirement
    const marginRequirement = reverseTradeType === 'long' ? 0.5 : 1.0

    // Calculate max trade value based on cash
    const maxTradeValue = usableCash / marginRequirement

    // Calculate max shares
    const maxShares = entry > 0 ? maxTradeValue / entry : 0

    // Calculate risk if stop loss is provided
    const riskPerShare = stopLoss ? Math.abs(stopLoss - entry) : 0
    const maxLoss = riskPerShare > 0 ? maxShares * riskPerShare : 0

    // Check if risk is acceptable (if account size and stop loss provided)
    let canAfford = true
    let affordabilityMessage = ''
    
    if (account && stopLoss) {
      const riskPercentage = account > 0 ? (maxLoss / account) * 100 : 0
      canAfford = riskPercentage <= 5
      affordabilityMessage = canAfford
        ? `✅ Risk is acceptable: ${riskPercentage.toFixed(2)}% of account (max 5%)`
        : `⚠️ Risk is high: ${riskPercentage.toFixed(2)}% of account (max 5% recommended)`
    } else {
      affordabilityMessage = stopLoss 
        ? '⚠️ Enter account size to check risk percentage'
        : 'ℹ️ Enter stop loss price to calculate risk'
    }

    return {
      maxLoss,
      riskPerShare,
      maxShares,
      tradeValue: maxTradeValue,
      initialMarginCost: usableCash,
      canAfford,
      affordabilityMessage
    }
  }

  const forwardResult = calculateForward()
  const reverseResult = calculateReverse()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
            <Calculator className="h-10 w-10" />
            Trading Buddy
          </h1>
          <p className="text-muted-foreground">Position Size Calculator</p>
        </div>

        <div className="flex gap-4 mb-6 justify-center">
          <Button
            variant={mode === 'forward' ? 'default' : 'outline'}
            onClick={() => setMode('forward')}
          >
            Forward Calculation
          </Button>
          <Button
            variant={mode === 'reverse' ? 'default' : 'outline'}
            onClick={() => setMode('reverse')}
          >
            Reverse Calculation
          </Button>
        </div>

        {mode === 'forward' ? (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Input Parameters</CardTitle>
                <CardDescription>
                  Enter your account details and trade parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountSize">Account Size (€)</Label>
                  <Input
                    id="accountSize"
                    type="number"
                    placeholder="10000"
                    value={accountSize}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setAccountSize(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="riskPercentage">Risk Percentage (%)</Label>
                  <Input
                    id="riskPercentage"
                    type="number"
                    placeholder="5"
                    value={riskPercentage}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setRiskPercentage(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: Never risk more than 5%
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entryPrice">Entry Price (€)</Label>
                  <Input
                    id="entryPrice"
                    type="number"
                    step="0.01"
                    placeholder="85.00"
                    value={entryPrice}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEntryPrice(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stopLossPrice">Stop Loss Price (€)</Label>
                  <Input
                    id="stopLossPrice"
                    type="number"
                    step="0.01"
                    placeholder="80.00"
                    value={stopLossPrice}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setStopLossPrice(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tradeType">Trade Type</Label>
                  <Select
                    id="tradeType"
                    value={tradeType}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setTradeType(e.target.value as TradeType)}
                  >
                    <option value="long">Long (50% margin)</option>
                    <option value="short">Short (100% margin)</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excessLiquidity">Excess Liquidity (€)</Label>
                  <Input
                    id="excessLiquidity"
                    type="number"
                    placeholder="1600"
                    value={excessLiquidity}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setExcessLiquidity(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Free cash available in your account
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calculation Results</CardTitle>
                <CardDescription>
                  Position size and affordability analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {forwardResult ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                        <span className="font-medium">Max Loss:</span>
                        <span className="text-lg font-bold">€{forwardResult.maxLoss.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                        <span className="font-medium">Risk Per Share:</span>
                        <span className="text-lg font-bold">€{forwardResult.riskPerShare.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                        <span className="font-medium">Max Shares:</span>
                        <span className="text-lg font-bold">{Math.floor(forwardResult.maxShares)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-primary/10 rounded-md border-2 border-primary">
                        <span className="font-medium">Trade Value:</span>
                        <span className="text-lg font-bold text-primary">€{forwardResult.tradeValue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                        <span className="font-medium">Initial Margin Cost:</span>
                        <span className="text-lg font-bold">€{forwardResult.initialMarginCost.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className={`p-4 rounded-md border-2 ${
                      forwardResult.canAfford 
                        ? 'bg-green-50 dark:bg-green-950 border-green-500' 
                        : 'bg-red-50 dark:bg-red-950 border-red-500'
                    }`}>
                      <div className="flex items-start gap-2">
                        {forwardResult.canAfford ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                        )}
                        <p className="text-sm font-medium">{forwardResult.affordabilityMessage}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Fill in all fields to see calculations</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Reverse Calculation</CardTitle>
                <CardDescription>
                  Start with available cash and calculate max trade size
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="availableCash">Excess Liquidity (€)</Label>
                  <Input
                    id="availableCash"
                    type="number"
                    placeholder="1600"
                    value={availableCash}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setAvailableCash(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    How much cash do you have available?
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cashUsagePercentage">Cash Usage (%)</Label>
                  <Input
                    id="cashUsagePercentage"
                    type="number"
                    placeholder="50"
                    value={cashUsagePercentage}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCashUsagePercentage(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentage of cash to use (recommended: 50% to avoid margin calls)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reverseEntryPrice">Entry Price (€)</Label>
                  <Input
                    id="reverseEntryPrice"
                    type="number"
                    step="0.01"
                    placeholder="85.00"
                    value={reverseEntryPrice}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setReverseEntryPrice(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reverseTradeType">Trade Type</Label>
                  <Select
                    id="reverseTradeType"
                    value={reverseTradeType}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setReverseTradeType(e.target.value as TradeType)}
                  >
                    <option value="long">Long (50% margin)</option>
                    <option value="short">Short (100% margin)</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reverseStopLossPrice">Stop Loss Price (€) - Optional</Label>
                  <Input
                    id="reverseStopLossPrice"
                    type="number"
                    step="0.01"
                    placeholder="80.00"
                    value={reverseStopLossPrice}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setReverseStopLossPrice(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter to check if the risk is acceptable
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reverseAccountSize">Account Size (€) - Optional</Label>
                  <Input
                    id="reverseAccountSize"
                    type="number"
                    placeholder="10000"
                    value={reverseAccountSize}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setReverseAccountSize(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter to check risk percentage
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calculation Results</CardTitle>
                <CardDescription>
                  Maximum trade size based on available cash
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reverseResult ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                        <span className="font-medium">Usable Cash:</span>
                        <span className="text-lg font-bold">€{reverseResult.initialMarginCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                        <span className="font-medium">Max Trade Value:</span>
                        <span className="text-lg font-bold">€{reverseResult.tradeValue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-primary/10 rounded-md border-2 border-primary">
                        <span className="font-medium">Max Shares:</span>
                        <span className="text-lg font-bold text-primary">{Math.floor(reverseResult.maxShares)}</span>
                      </div>
                      {reverseResult.riskPerShare > 0 && (
                        <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                          <span className="font-medium">Risk Per Share:</span>
                          <span className="text-lg font-bold">€{reverseResult.riskPerShare.toFixed(2)}</span>
                        </div>
                      )}
                      {reverseResult.maxLoss > 0 && (
                        <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                          <span className="font-medium">Max Loss:</span>
                          <span className="text-lg font-bold">€{reverseResult.maxLoss.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <div className={`p-4 rounded-md border-2 ${
                      reverseResult.canAfford 
                        ? 'bg-green-50 dark:bg-green-950 border-green-500' 
                        : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-500'
                    }`}>
                      <div className="flex items-start gap-2">
                        {reverseResult.canAfford ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        )}
                        <p className="text-sm font-medium">{reverseResult.affordabilityMessage}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Fill in cash, usage %, entry price, and trade type to see calculations</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
