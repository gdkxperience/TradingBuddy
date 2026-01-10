'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LandingPage } from '@/components/LandingPage'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/app')
  }

  // If user is already logged in and visits landing, they can still see it
  // but the CTA will take them to /app

  return <LandingPage onGetStarted={handleGetStarted} />
}
