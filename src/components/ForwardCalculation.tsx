import { ForwardCalculationInputs, CalculationResult } from '@/types'
import { calculateForward } from '@/lib/calculations'
import { ForwardCalculationForm } from './ForwardCalculationForm'
import { CalculationResults } from './CalculationResults'
import { ScenarioSandbox } from './ScenarioSandbox'

interface ForwardCalculationProps {
  inputs: ForwardCalculationInputs
  onInputChange: <K extends keyof ForwardCalculationInputs>(
    field: K,
    value: ForwardCalculationInputs[K]
  ) => void
  onSaveToJournal?: (result: CalculationResult, inputs: ForwardCalculationInputs) => void
}

export function ForwardCalculation({ inputs, onInputChange, onSaveToJournal }: ForwardCalculationProps) {
  const result = calculateForward(inputs)

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
        <ForwardCalculationForm inputs={inputs} onInputChange={onInputChange} />
        <CalculationResults
          result={result}
          title="Calculation Results"
          description="Position size and affordability analysis"
          emptyMessage="Fill in all fields to see calculations"
          variant="forward"
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
