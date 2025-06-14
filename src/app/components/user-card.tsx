// src/app/components/user-card.tsx
'use client'

import { useAuth } from '@/app/providers/auth-provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/components/ui/card'
import { cn } from '@/app/lib/utils'

export function UserCard() {
  const { user } = useAuth()

  if (!user) return null

  const getInitials = (name?: string | null) => {
    if (!name?.trim()) return 'US' // Gère les cas null/undefined/chaîne vide
    
    return name
      .trim()
      .split(/\s+/) // Sépare sur tous les espaces (y compris multiples)
      .filter(part => part.length > 0)
      .slice(0, 2) // Prend seulement les 2 premiers mots
      .map(part => part[0].toUpperCase())
      .join('')
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Profil Utilisateur</CardTitle>
        <CardDescription>Informations du compte</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <Avatar>
          <AvatarImage 
            src={user.image || undefined} 
            alt={`Avatar de ${user.name || 'utilisateur'}`}
          />
          <AvatarFallback className={cn(
            "bg-gray-100 dark:bg-gray-800",
            user.role === 'ADMIN' && "bg-purple-100 dark:bg-purple-900"
          )}>
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1">
          <h3 className="text-lg font-medium">
            {user.name || 'Utilisateur'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user.email}
          </p>
          <div className="flex items-center gap-2">
            <span className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              user.role === 'ADMIN'
                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            )}>
              {user.role}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}