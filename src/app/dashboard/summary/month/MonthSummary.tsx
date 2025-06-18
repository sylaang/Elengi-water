'use client';

import { useEffect, useState } from 'react';

type Summary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  weeklySummaries: Array<{
    weekStart: string;
    weekEnd: string;
    totalIncome: number;
    totalExpense: number;
    balance: number;
  }>;
};

export default function MonthSummary() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('/api/operations/summary/month');
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
          <h3 className="text-sm font-medium text-green-800">Revenus du mois</h3>
          <p className="text-2xl font-bold text-green-600">{summary.totalIncome.toFixed(2)} €</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-800">Dépenses du mois</h3>
          <p className="text-2xl font-bold text-red-600">{summary.totalExpense.toFixed(2)} €</p>
        </div>
        <div className={`p-4 rounded-lg ${summary.balance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <h3 className="text-sm font-medium">Solde du mois</h3>
          <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summary.balance.toFixed(2)} €
          </p>
        </div>
      </div>

      {/* Résumé hebdomadaire */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Résumé par semaine</h2>
        <div className="space-y-2">
          {summary.weeklySummaries.map((week) => (
            <div
              key={week.weekStart}
              className="p-4 rounded-lg bg-white shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    Semaine du {new Date(week.weekStart).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long'
                    })} au {new Date(week.weekEnd).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long'
                    })}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-sm text-green-600">+{week.totalIncome.toFixed(2)} €</p>
                    <p className="text-sm text-red-600">-{week.totalExpense.toFixed(2)} €</p>
                  </div>
                  <div className={`text-right font-bold ${
                    week.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {week.balance.toFixed(2)} €
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 