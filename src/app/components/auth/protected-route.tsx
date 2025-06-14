// src/app/components/auth/protected-route.tsx
'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers/auth-provider'
import { useEffect, startTransition } from 'react'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute({
  children,
  requiredRole = 'USER'
}: {
  children: React.ReactNode
  requiredRole?: 'USER' | 'ADMIN'
}) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    startTransition(() => {
      if (!isAuthenticated) {
        router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname))
        return
      }
      
      if (requiredRole === 'ADMIN' && user?.role !== 'ADMIN') {
        router.push('/dashboard/user')
        return
      }

      if (requiredRole === 'USER' && user?.role !== 'USER' && user?.role !== 'ADMIN') {
        router.push('/unauthorized')
        return
      }
    })
  }, [isAuthenticated, isLoading, router, requiredRole, user?.role])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole === 'ADMIN' && user?.role !== 'ADMIN') {
    return null
  }

  if (requiredRole === 'USER' && user?.role !== 'USER' && user?.role !== 'ADMIN') {
    return null
  }

  return <>{children}</>
}