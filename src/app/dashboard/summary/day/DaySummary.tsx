'use client';

import { useEffect, useState } from 'react';

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
  }>;
};

export default function DaySummary() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('/api/operations/summary/day');
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error('Erreur lors du chargement du résumé:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!summary) {
    return <div>Aucune donnée disponible</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Revenus du jour</h3>
          <p className="text-2xl font-bold text-green-600">{summary.totalIncome.toFixed(2)} €</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-800">Dépenses du jour</h3>
          <p className="text-2xl font-bold text-red-600">{summary.totalExpense.toFixed(2)} €</p>
        </div>
        <div className={`p-4 rounded-lg ${summary.balance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <h3 className="text-sm font-medium">Solde du jour</h3>
          <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summary.balance.toFixed(2)} €
          </p>
        </div>
      </div>

      {/* Liste des opérations */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Opérations du jour</h2>
        <div className="space-y-2">
          {summary.operations.map((operation) => (
            <div
              key={operation.id}
              className="p-4 rounded-lg bg-white shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{operation.description}</p>
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