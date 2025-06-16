import { ProtectedRoute } from '@/app/components/auth/protected-route'
import { CreateUserForm } from '@/app/components/auth/create-user-form'

export default function CreateUserPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div>
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
          Créer un nouvel utilisateur
        </h1>
        <div className="max-w-2xl">
          <CreateUserForm />
        </div>
      </div>
    </ProtectedRoute>
  )
} 