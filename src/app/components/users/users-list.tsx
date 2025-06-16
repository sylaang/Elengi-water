'use client'

import { useEffect, useState } from 'react'
import { User } from '@prisma/client'
import { EditUserDialog } from './edit-user-dialog'
import { Trash2 } from 'lucide-react'

export function UsersList() {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users')
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des utilisateurs')
            }
            const data = await response.json()
            setUsers(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleDelete = async (userId: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            return
        }

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Erreur lors de la suppression')
            }

            
            fetchUsers()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue')
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-red-600 p-4">
                {error}
            </div>
        )
    }

    return (
        <div className="userlist-wrapper">
            <div className="userlist-container">
                <h2 className="userlist-title">Liste des utilisateurs</h2>
                <div className="overflow-x-auto">
                    <table className="userlist-table">
                        <thead className="userlist-thead">
                            <tr>
                                <th className="userlist-th">Nom</th>
                                <th className="userlist-th">Email</th>
                                <th className="userlist-th">Rôle</th>
                                <th className="userlist-th">Date de création</th>
                                <th className="userlist-th">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="userlist-tbody">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="userlist-td text-base">{user.name || 'Non renseigné'}</td>
                                    <td className="userlist-td text-sm text-muted">{user.email}</td>
                                    <td className="userlist-td">
                                        <span
                                            className={`userlist-badge ${user.role === 'ADMIN'
                                                    ? 'badge-admin'
                                                    : 'badge-user'
                                                }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="userlist-td text-sm text-muted">
                                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="userlist-td text-sm text-muted">
                                        <div className="flex space-x-2">
                                            <EditUserDialog user={user} onUserUpdated={fetchUsers} />
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
} 