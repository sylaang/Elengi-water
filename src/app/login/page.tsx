import { LoginForm } from '@/app/components/auth/login-form'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import type { SearchParams } from '@/types'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  // On commence par attendre la résolution des données asynchrones
  const [session, params] = await Promise.all([
    auth(),
    Promise.resolve(searchParams)
  ])
  
  // Gestion plus robuste de searchParams
  const callbackUrl = getValidCallbackUrl(params?.callbackUrl)

  if (session?.user) {
    redirect(getSafeRedirectUrl(callbackUrl))
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Connexion</h1>
          <p className="mt-2 text-gray-600">Accédez à votre espace administrateur</p>
        </div>
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </div>
  )
}

// Nouvelle fonction pour valider le callbackUrl
function getValidCallbackUrl(param: unknown): string | undefined {
  if (typeof param === 'string') return param
  if (Array.isArray(param)) return param[0] 
  return undefined
}

// Fonction utilitaire améliorée
function getSafeRedirectUrl(callbackUrl?: string): string {
  const defaultUrl = '/dashboard'
  
  if (!callbackUrl) return defaultUrl

  try {
    const decodedUrl = decodeURIComponent(callbackUrl)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const parsedUrl = new URL(decodedUrl, baseUrl)

    // Validation renforcée
    const isAllowed = (
      ['http:', 'https:'].includes(parsedUrl.protocol) &&
      (
        parsedUrl.hostname === 'localhost' ||
        parsedUrl.hostname === new URL(baseUrl).hostname
      ) &&
      !parsedUrl.pathname.includes('//') &&
      parsedUrl.pathname.startsWith('/')
    )

    return isAllowed ? `${parsedUrl.pathname}${parsedUrl.search}` : defaultUrl
  } catch (error) {
    console.error('Invalid redirect URL:', error)
    return defaultUrl
  }
}