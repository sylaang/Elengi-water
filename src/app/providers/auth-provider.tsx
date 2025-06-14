// app/providers/auth-provider.tsx
'use client'
import { SessionProvider, useSession } from 'next-auth/react'
import { ReactNode } from 'react'

export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider refetchInterval={5 * 60}>{children}</SessionProvider>
}

export const useAuth = () => {
  const { data: session, status, update } = useSession()
  
  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    isAdmin: session?.user?.role === 'ADMIN',
    updateSession: update
  }
}