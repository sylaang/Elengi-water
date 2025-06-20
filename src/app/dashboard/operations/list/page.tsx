'use client';

import { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/providers/auth-provider';
import { UserFilter } from '@/app/components/ui/user-filter';

type Operation = {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  description: string | null;
  date: string;
  category: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    name: string | null;
    email: string;
  };
};

export default function OperationsListPage() {
  const { user } = useAuth();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchOperations();
  }, [selectedUserId]);

  const fetchOperations = async () => {
    try {
      const url = new URL('/api/operations', window.location.origin);
      url.searchParams.set('limit', '100');
      if (selectedUserId) {
        url.searchParams.set('userId', selectedUserId.toString());
      }
      
      const response = await fetch(url.toString());
      const data = await response.json();
      setOperations(data.operations || []);
    } catch (error) {
      console.error('Erreur lors du chargement des opérations:', error);
      setMessage({ text: 'Erreur lors du chargement des opérations', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (operationId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette opération ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/operations/${operationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      setMessage({ text: '✅ Opération supprimée avec succès', isError: false });
      fetchOperations(); // Recharger la liste
    } catch (error) {
      setMessage({
        text: `❌ Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}`,
        isError: true
      });
    }
  };

  const handleEdit = (operationId: number) => {
    // Rediriger vers la page d'édition
    window.location.href = `/dashboard/operations/edit/${operationId}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <p>Chargement des opérations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 overflow-x-hidden w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 w-full">
        <h1 className="text-2xl font-bold">
          Liste des Opérations
          {user?.role === 'ADMIN' && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              (Toutes les opérations)
            </span>
          )}
        </h1>
        <Link
          href="/dashboard/operations"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          Nouvelle opération
        </Link>
      </div>

      {user?.role === 'ADMIN' && (
        <div className="mb-6 p-4 rounded-lg w-full">
          <UserFilter
            selectedUserId={selectedUserId}
            onUserChange={setSelectedUserId}
          />
        </div>
      )}

      {message && (
        <div
          className={`p-3 rounded-md mb-4 w-full ${
            message.isError
              ? 'bg-red-50 text-red-800'
              : 'bg-green-50 text-green-800'
          }`}
        >
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {operations.length === 0 ? (
        <div className="text-center py-8 w-full">
          <p className="text-gray-500">
            {selectedUserId 
              ? 'Aucune opération trouvée pour cet utilisateur' 
              : 'Aucune opération trouvée'
            }
          </p>
          <Link
            href="/dashboard/operations"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Créer votre première opération
          </Link>
        </div>
      ) : (
<div className="space-y-4 w-full">
  {operations.map((operation) => (
    <div
      key={operation.id}
      className="p-4 rounded-lg content-home border border-gray-200 w-full overflow-x-auto"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 w-full flex-wrap">
        {/* Partie gauche : infos de l'opération */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              operation.type === 'income' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {operation.type === 'income' ? 'Revenu' : 'Dépense'}
            </span>
            <span className="text-sm">{operation.category.name}</span>
            {user?.role === 'ADMIN' && !selectedUserId && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <TrendingUp className="w-3 h-3" />
                <span>{operation.user.name || operation.user.email}</span>
              </div>
            )}
          </div>

          {operation.description && (
            <p className="mb-2 break-words">{operation.description}</p>
          )}

          <p className="text-sm text-gray-500">
            {new Date(operation.date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Partie droite : montant + boutons */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
          <p className={`text-lg font-bold ${
            operation.type === 'income' ? 'text-green-600' : 'text-red-600'
          }`}>
            {operation.type === 'income' ? '+' : '-'}{operation.amount.toFixed(2)} €
          </p>

          <div className="flex gap-1">
            <button
              onClick={() => handleEdit(operation.id)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Modifier"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(operation.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
      )}
    </div>
  );
} 