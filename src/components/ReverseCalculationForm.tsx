import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ReverseCalculationInputs } from '@/types'
import { InputField } from './InputField'
import { TradeTypeSelect } from './TradeTypeSelect'
import { DEFAULT_CASH_USAGE_PERCENTAGE } from '@/lib/calculations'

interface ReverseCalculationFormProps {
  inputs: ReverseCalculationInputs
  onInputChange: <K extends keyof ReverseCalculationInputs>(
    field: K,
    value: ReverseCalculationInputs[K]
  ) => void
}

export function ReverseCalculationForm({ inputs, onInputChange }: ReverseCalculationFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reverse Calculation</CardTitle>
        <CardDescription>
          Start with available cash and calculate max trade size
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <InputField
          id="availableCash"
          label="Excess Liquidity (€)"
          value={inputs.availableCash}
          onChange={(value) => onInputChange('availableCash', value)}
          placeholder="1600"
          hint="How much cash do you have available?"
          required
        />

        <InputField
          id="cashUsagePercentage"
          label="Cash Usage (%)"
          value={inputs.cashUsagePercentage}
          onChange={(value) => onInputChange('cashUsagePercentage', value)}
          placeholder={DEFAULT_CASH_USAGE_PERCENTAGE.toString()}
          hint="Percentage of cash to use (recommended: 50% to avoid margin calls)"
          required
        />

        <InputField
          id="reverseEntryPrice"
          label="Entry Price (€)"
          value={inputs.entryPrice}
          onChange={(value) => onInputChange('entryPrice', value)}
          placeholder="85.00"
          step="0.01"
          required
        />

        <TradeTypeSelect
          id="reverseTradeType"
          value={inputs.tradeType}
          onChange={(value) => onInputChange('tradeType', value)}
        />

        <InputField
          id="reverseStopLossPrice"
          label="Stop Loss Price (€) - Optional"
          value={inputs.stopLossPrice}
          onChange={(value) => onInputChange('stopLossPrice', value)}
          placeholder="80.00"
          step="0.01"
          hint="Enter to check if the risk is acceptable"
        />

        <InputField
          id="reverseAccountSize"
          label="Account Size (€) - Optional"
          value={inputs.accountSize}
          onChange={(value) => onInputChange('accountSize', value)}
          placeholder="10000"
          hint="Enter to check risk percentage"
        />
      </CardContent>
    </Card>
  )
}
