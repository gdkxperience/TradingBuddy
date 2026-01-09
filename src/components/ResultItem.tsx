interface ResultItemProps {
  label: string
  value: string | number
  highlight?: boolean
  isCurrency?: boolean // Whether to format as currency (default: true)
  decimals?: number // Number of decimal places (default: 2 for currency, 0 for non-currency)
}

export function ResultItem({ label, value, highlight = false, isCurrency = true, decimals }: ResultItemProps) {
  // Determine decimal places: use provided, or default based on currency
  const decimalPlaces = decimals !== undefined ? decimals : (isCurrency ? 2 : 0)
  
  const displayValue = typeof value === 'number' 
    ? value.toFixed(decimalPlaces) 
    : value
  
  const formattedValue = typeof value === 'number' && !isNaN(value) 
    ? (isCurrency && value >= 0 ? `€${displayValue}` : displayValue)
    : displayValue

  return (
    <div className={`flex justify-between items-center p-3 rounded-md ${
      highlight 
        ? 'bg-primary/10 border-2 border-primary' 
        : 'bg-muted'
    }`}>
      <span className="font-medium">{label}:</span>
      <span className={`text-lg font-bold ${highlight ? 'text-primary' : ''}`}>
        {formattedValue}
      </span>
    </div>
  )
}
