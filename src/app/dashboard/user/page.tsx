import { ProtectedRoute } from '@/app/components/auth/protected-route'
import { UserCard } from '@/app/components/user-card'
import { LogoutButton } from '@/app/components/auth/logout-button'

export default function UserDashboardPage() {
  return (
    <ProtectedRoute requiredRole="USER">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tableau de bord Utilisateur</h1>
          <LogoutButton />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <UserCard />
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Bienvenue sur votre espace personnel</h2>
            <p className="text-gray-600">
              Vous pouvez consulter vos informations personnelles et gérer votre compte ici.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 