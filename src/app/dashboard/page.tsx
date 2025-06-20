// src/app/dashboard/page.tsx
import { ProtectedRoute } from '@/app/components/auth/protected-route'
import { UserCard } from '@/app/components/user-card'

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="px-4 py-6 overflow-x-hidden w-full">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
          Tableau de bord Administrateur
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <UserCard />
          <div className="p-6 rounded-lg shadow-md w-full" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Bienvenue sur votre espace administrateur</h2>
            <p style={{ color: 'var(--subtitle-color)' }}>
              Vous pouvez gérer les utilisateurs et consulter les statistiques depuis ce tableau de bord.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}