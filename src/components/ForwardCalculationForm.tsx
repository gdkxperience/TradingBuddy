import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ForwardCalculationInputs } from '@/types'
import { InputField } from './InputField'
import { TradeTypeSelect } from './TradeTypeSelect'
import { DEFAULT_RISK_PERCENTAGE } from '@/lib/calculations'

interface ForwardCalculationFormProps {
  inputs: ForwardCalculationInputs
  onInputChange: <K extends keyof ForwardCalculationInputs>(
    field: K,
    value: ForwardCalculationInputs[K]
  ) => void
}

export function ForwardCalculationForm({ inputs, onInputChange }: ForwardCalculationFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Parameters</CardTitle>
        <CardDescription>
          Enter your account details and trade parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <InputField
          id="accountSize"
          label="Account Size (€)"
          value={inputs.accountSize}
          onChange={(value) => onInputChange('accountSize', value)}
          placeholder="10000"
          required
        />

        <InputField
          id="riskPercentage"
          label="Risk Percentage (%)"
          value={inputs.riskPercentage}
          onChange={(value) => onInputChange('riskPercentage', value)}
          placeholder={DEFAULT_RISK_PERCENTAGE.toString()}
          hint="Recommended: Never risk more than 5%"
          required
        />

        <InputField
          id="entryPrice"
          label="Entry Price (€)"
          value={inputs.entryPrice}
          onChange={(value) => onInputChange('entryPrice', value)}
          placeholder="85.00"
          step="0.01"
          required
        />

        <InputField
          id="stopLossPrice"
          label="Stop Loss Price (€)"
          value={inputs.stopLossPrice}
          onChange={(value) => onInputChange('stopLossPrice', value)}
          placeholder="80.00"
          step="0.01"
          required
        />

        <InputField
          id="targetPrice"
          label="Target Price (€) - Optional"
          value={inputs.targetPrice}
          onChange={(value) => onInputChange('targetPrice', value)}
          placeholder="95.00"
          step="0.01"
          hint="Enter target price to calculate Risk:Reward ratio (R-Multiple)"
        />

        <TradeTypeSelect
          id="tradeType"
          value={inputs.tradeType}
          onChange={(value) => onInputChange('tradeType', value)}
        />

        <InputField
          id="excessLiquidity"
          label="Excess Liquidity (€)"
          value={inputs.excessLiquidity}
          onChange={(value) => onInputChange('excessLiquidity', value)}
          placeholder="1600"
          hint="Free cash available in your account"
          required
        />
      </CardContent>
    </Card>
  )
}
