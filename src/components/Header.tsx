import { Calculator } from 'lucide-react'

export function Header() {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
        <Calculator className="h-10 w-10" />
        Trading Buddy
      </h1>
      <p className="text-muted-foreground">Position Size Calculator</p>
    </div>
  )
}
