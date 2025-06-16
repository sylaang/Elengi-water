'use client'

import { useState } from 'react'
import { User } from '@prisma/client'
import { Pencil, X } from 'lucide-react'

interface EditUserDialogProps {
  user: User
  onUserUpdated: () => void
}

export function EditUserDialog({ user, onUserUpdated }: EditUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email,
    role: user.role,
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la modification')
      }

      setIsOpen(false)
      onUserUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
  <button
    onClick={() => setIsOpen(true)}
    className="text-blue-600 hover:text-blue-800"
  >
    <Pencil className="h-4 w-4" />
  </button>

  {isOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="createuser-wrapper max-w-md w-full rounded-lg p-6 bg-white">

      <div className="flex justify-between items-center mb-4">
        <h2 className="createuser-title">Modifier l'utilisateur</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label">Nom</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Rôle</label>
          <select
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'USER' })
            }
            className="form-input"
          >
            <option value="USER">Utilisateur</option>
            <option value="ADMIN">Administrateur</option>
          </select>
        </div>

        <div>
          <label className="form-label">Nouveau mot de passe (optionnel)</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="form-input"
          />
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="form-button"
          >
            {isLoading ? 'Modification...' : 'Modifier'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
</>
  )
} 