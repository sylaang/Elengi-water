import { ProtectedRoute } from '@/app/components/auth/protected-route'
import { UsersList } from '@/app/components/users/users-list'

export default function UsersPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div>
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
          Liste des utilisateurs
        </h1>
        <UsersList />
      </div>
    </ProtectedRoute>
  )
} 