'use client'

import { CalculationMode, ForwardCalculationInputs, ReverseCalculationInputs, CalculationResult } from '@/types'
import { ModeSelector } from '@/components/ModeSelector'
import { ForwardCalculation } from '@/components/ForwardCalculation'
import { ReverseCalculation } from '@/components/ReverseCalculation'

interface CalculatorViewProps {
  mode: CalculationMode
  onModeChange: (mode: CalculationMode) => void
  forwardInputs: ForwardCalculationInputs
  reverseInputs: ReverseCalculationInputs
  onForwardInputChange: <K extends keyof ForwardCalculationInputs>(
    field: K,
    value: ForwardCalculationInputs[K]
  ) => void
  onReverseInputChange: <K extends keyof ReverseCalculationInputs>(
    field: K,
    value: ReverseCalculationInputs[K]
  ) => void
  onSaveToJournal: (result: CalculationResult, inputs: ForwardCalculationInputs | ReverseCalculationInputs) => void
}

export function CalculatorView({
  mode,
  onModeChange,
  forwardInputs,
  reverseInputs,
  onForwardInputChange,
  onReverseInputChange,
  onSaveToJournal,
}: CalculatorViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Position Size Calculator</h2>
        <p className="text-muted-foreground">
          Calculate optimal position sizes with risk management
        </p>
      </div>
      
      <ModeSelector mode={mode} onModeChange={onModeChange} />
      
      {mode === 'forward' ? (
          <ForwardCalculation 
            inputs={forwardInputs} 
            onInputChange={onForwardInputChange}
            onSaveToJournal={onSaveToJournal}
          />
        ) : (
          <ReverseCalculation 
            inputs={reverseInputs} 
            onInputChange={onReverseInputChange}
            onSaveToJournal={onSaveToJournal}
          />
        )}
    </div>
  )
}
