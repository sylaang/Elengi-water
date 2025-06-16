// app/components/auth/login-form.tsx
'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { cn } from "@/lib/utils"

interface LoginFormProps {
  callbackUrl?: string
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlCallback = callbackUrl || searchParams.get('callbackUrl') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      const response = await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirect: false,
        callbackUrl: urlCallback
      })

      if (response?.error) {
        // Gestion spécifique des erreurs courantes
        if (response.error === 'CredentialsSignin') {
          setError('Email ou mot de passe incorrect')
        } else {
          setError(response.error)
        }
        return
      }

      // Redirection manuelle après succès
      if (response?.url) {
        router.push(response.url)
        router.refresh()
      } else {
        router.push(urlCallback)
        router.refresh()
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue')
      console.error('Erreur de connexion:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="email" className="form-label">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">Mot de passe</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="form-input"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "form-submit",
            loading && "form-submit-disabled"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="form-loader-icon" />
              Connexion...
            </>
          ) : (
            'Se connecter'
          )}
        </button>
      </div>
    </form>
  )
}