// src/app/dashboard/page.tsx
import { ProtectedRoute } from '@/app/components/auth/protected-route'
import { UserCard } from '@/app/components/user-card'
import { LogoutButton } from '@/app/components/auth/logout-button'
import { CreateUserForm } from '@/app/components/auth/create-user-form'
import { UsersList } from '@/app/components/users/users-list'

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Administrateur</h1>
            <LogoutButton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <UserCard />
            <CreateUserForm />
          </div>
          <UsersList />
        </div>
      </div>
    </ProtectedRoute>
  )
}