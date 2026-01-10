import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/components/SessionProvider'

export const metadata: Metadata = {
  title: 'Trading Buddy - Position Size Calculator',
  description: 'Calculate optimal position sizes for trading with risk management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
