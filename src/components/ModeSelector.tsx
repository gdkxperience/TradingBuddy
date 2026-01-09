import { Button } from '@/components/ui/button'
import { CalculationMode } from '@/types'

interface ModeSelectorProps {
  mode: CalculationMode
  onModeChange: (mode: CalculationMode) => void
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex gap-4 mb-6 justify-center">
      <Button
        variant={mode === 'forward' ? 'default' : 'outline'}
        onClick={() => onModeChange('forward')}
      >
        Forward Calculation
      </Button>
      <Button
        variant={mode === 'reverse' ? 'default' : 'outline'}
        onClick={() => onModeChange('reverse')}
      >
        Reverse Calculation
      </Button>
    </div>
  )
}
