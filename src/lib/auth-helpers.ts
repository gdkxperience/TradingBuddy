import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

/**
 * Get the current user session on the server side
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

/**
 * Get the current user ID on the server side
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return session?.user?.id || null
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(): Promise<{ id: string; email: string }> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  
  return {
    id: session.user.id,
    email: session.user.email!
  }
}
