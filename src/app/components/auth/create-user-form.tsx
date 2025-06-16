'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function CreateUserForm() {
    const router = useRouter()
    const formRef = useRef<HTMLFormElement>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccess(null)

        const formData = new FormData(event.currentTarget)
        const data = {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            name: formData.get('name') as string,
            role: formData.get('role') as 'ADMIN' | 'USER'
        }

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Une erreur est survenue')
            }

            setSuccess('Utilisateur créé avec succès !')
            formRef.current?.reset()
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="createuser-wrapper">
            <h2 className="createuser-title">Créer un nouvel utilisateur</h2>
            <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="form-label">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        className="form-input"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="form-label">
                        Mot de passe
                    </label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        required
                        className="form-input"
                    />
                </div>

                <div>
                    <label htmlFor="name" className="form-label">
                        Nom
                    </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="form-input"
                    />
                </div>

                <div>
                    <label htmlFor="role" className="form-label">
                        Rôle
                    </label>
                    <select
                        name="role"
                        id="role"
                        required
                        className="form-input"
                    >
                        <option value="USER">Utilisateur</option>
                        <option value="ADMIN">Administrateur</option>
                    </select>
                </div>

                {error && (
                    <div className="form-error">{error}</div>
                )}

                {success && (
                    <div className="form-success">{success}</div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="form-button"
                >
                    {isLoading ? 'Création en cours...' : 'Créer l\'utilisateur'}
                </button>
            </form>
        </div>
    )
} 