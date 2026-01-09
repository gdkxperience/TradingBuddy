import { ChangeEvent } from 'react'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { TradeType } from '@/types'

interface TradeTypeSelectProps {
  id: string
  value: TradeType
  onChange: (value: TradeType) => void
}

export function TradeTypeSelect({ id, value, onChange }: TradeTypeSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Trade Type</Label>
      <Select
        id={id}
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value as TradeType)}
      >
        <option value="long">Long (50% margin)</option>
        <option value="short">Short (100% margin)</option>
      </Select>
    </div>
  )
}
