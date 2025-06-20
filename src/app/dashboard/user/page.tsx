import { ProtectedRoute } from '@/app/components/auth/protected-route'
import { UserCard } from '@/app/components/user-card'
import { LogoutButton } from '@/app/components/auth/logout-button'

export default function UserDashboardPage() {
  return (
    <ProtectedRoute requiredRole="USER">
      <div className="px-4 py-6 overflow-x-hidden w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 w-full">
          <h1 className="createuser-title">Tableau de bord Utilisateur</h1>
          <LogoutButton />
        </div>
        <div className="grid grid-cols-1 gap-6 w-full">
          <UserCard />
          <div className="createuser-wrapper w-full">
            <h2 className="createuser-title">Bienvenue sur votre espace personnel</h2>
            <p className="text-gray-600">
              Vous pouvez consulter vos informations personnelles et gérer votre compte ici.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 