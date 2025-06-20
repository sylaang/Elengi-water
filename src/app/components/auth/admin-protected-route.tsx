'use client';

import { useAuth } from '@/app/providers/auth-provider';
import Link from 'next/link';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminProtectedRoute({ children, fallback }: AdminProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Pendant le chargement, afficher un message de chargement
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <p>Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté
  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="p-4 bg-red-50 rounded-lg max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Accès Refusé</h2>
            <p className="text-red-700 mb-4">
              Vous devez être connecté pour accéder à cette page.
            </p>
            <Link
              href="/login"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas admin
  if (user.role !== 'ADMIN') {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="p-4 bg-red-50 rounded-lg max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Accès Refusé</h2>
            <p className="text-red-700 mb-4">
              Seuls les administrateurs peuvent accéder à cette page.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est admin, afficher le contenu
  return <>{children}</>;
} 