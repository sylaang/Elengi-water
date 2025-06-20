'use client';

import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { useAuth } from '@/app/providers/auth-provider';
import { UserFilter } from '@/app/components/ui/user-filter';

type Summary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  operations: Array<{
    id: number;
    amount: number;
    type: 'income' | 'expense';
    description: string;
    date: string;
    user?: {
      id: number;
      name: string | null;
      email: string;
    };
  }>;
  isAdmin?: boolean;
  totalOperations?: number;
  filteredByUser?: number | null;
};

export default function DaySummary() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchSummary();
  }, [selectedUserId]);

  const fetchSummary = async () => {
    try {
      const url = new URL('/api/operations/summary/day', window.location.origin);
      if (selectedUserId) {
        url.searchParams.set('userId', selectedUserId.toString());
      }
      
      const response = await fetch(url.toString());
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Erreur lors du chargement du résumé:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!summary) {
    return <div>Aucune donnée disponible</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filtre utilisateur (admin uniquement) */}
      {user?.role === 'ADMIN' && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <UserFilter
            selectedUserId={selectedUserId}
            onUserChange={setSelectedUserId}
          />
        </div>
      )}

      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">
            {summary.isAdmin ? 'Revenus totaux du jour' : 'Revenus du jour'}
          </h3>
          <p className="text-2xl font-bold text-green-600">{summary.totalIncome.toFixed(2)} €</p>
          {summary.isAdmin && summary.totalOperations && (
            <p className="text-xs text-green-600 mt-1">
              {summary.totalOperations} opération(s)
            </p>
          )}
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-800">
            {summary.isAdmin ? 'Dépenses totales du jour' : 'Dépenses du jour'}
          </h3>
          <p className="text-2xl font-bold text-red-600">{summary.totalExpense.toFixed(2)} €</p>
        </div>
        <div className={`p-4 rounded-lg ${summary.balance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <h3 className="text-sm font-medium">
            {summary.isAdmin ? 'Solde total du jour' : 'Solde du jour'}
          </h3>
          <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summary.balance.toFixed(2)} €
          </p>
        </div>
      </div>

      {/* Liste des opérations */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          {summary.isAdmin ? 'Toutes les opérations du jour' : 'Opérations du jour'}
        </h2>
        <div className="space-y-2">
          {summary.operations.map((operation) => (
            <div
              key={operation.id}
              className="p-4 rounded-lg bg-white shadow"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{operation.description}</p>
                    {/* Afficher l'utilisateur si on est admin et qu'aucun filtre n'est appliqué */}
                    {summary.isAdmin && operation.user && !selectedUserId && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <User className="w-3 h-3" />
                        <span>{operation.user.name || operation.user.email}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(operation.date).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <p className={`font-bold ${
                  operation.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {operation.type === 'income' ? '+' : '-'}{operation.amount.toFixed(2)} €
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 