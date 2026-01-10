import { ReverseCalculationInputs, CalculationResult } from '@/types'
import { calculateReverse } from '@/lib/calculations'
import { ReverseCalculationForm } from './ReverseCalculationForm'
import { CalculationResults } from './CalculationResults'
import { ScenarioSandbox } from './ScenarioSandbox'

interface ReverseCalculationProps {
  inputs: ReverseCalculationInputs
  onInputChange: <K extends keyof ReverseCalculationInputs>(
    field: K,
    value: ReverseCalculationInputs[K]
  ) => void
  onSaveToJournal?: (result: CalculationResult, inputs: ReverseCalculationInputs) => void
}

export function ReverseCalculation({ inputs, onInputChange, onSaveToJournal }: ReverseCalculationProps) {
  const result = calculateReverse(inputs)

  const handleSaveClick = () => {
    if (result && onSaveToJournal) {
      onSaveToJournal(result, inputs)
    }
  }

  const entryPrice = parseFloat(inputs.entryPrice) || 0
  const stopLossPrice = parseFloat(inputs.stopLossPrice) || null

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <ReverseCalculationForm inputs={inputs} onInputChange={onInputChange} />
        <CalculationResults
          result={result}
          title="Calculation Results"
          description="Maximum trade size based on available cash"
          emptyMessage="Fill in cash, usage %, entry price, and trade type to see calculations"
          variant="reverse"
          showFields={{
            usableCash: true,
            tradeValue: true,
            maxShares: true,
            riskPerShare: true,
            maxLoss: true,
            initialMarginCost: false
          }}
          onSaveToJournal={handleSaveClick}
          entryPrice={entryPrice}
          stopLossPrice={stopLossPrice}
          direction={inputs.tradeType}
        />
      </div>
      
      {result && result.maxShares > 0 && entryPrice > 0 && (
        <ScenarioSandbox
          entryPrice={entryPrice}
          stopLossPrice={stopLossPrice}
          positionSize={result.maxShares}
          direction={inputs.tradeType}
          tradeValue={result.tradeValue}
        />
      )}
    </div>
  )
}
