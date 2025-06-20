'use client'

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: '/login',
        redirect: true 
      })
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      // En cas d'erreur, rediriger manuellement
      window.location.href = '/login'
    }
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
    >
      <LogOut className="h-4 w-4" />
      Déconnexion
    </button>
  )
} 