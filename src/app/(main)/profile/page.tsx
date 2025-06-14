// app/(main)/profile/page.tsx
import { UserCard } from '@/app/components/user-card'
import { ProtectedRoute } from '@/app/components/auth/protected-route'

export default function ProfilePage() {
  return (
    <ProtectedRoute requiredRole="USER">
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>
        <UserCard />
      </div>
    </ProtectedRoute>
  )
}