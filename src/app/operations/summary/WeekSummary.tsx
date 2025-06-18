'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

type Summary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  dailySummaries: Array<{
    date: string;
    totalIncome: number;
    totalExpense: number;
    balance: number;
  }>;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'];

export default function WeekSummary() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('/api/operations/summary/week');
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

  // Préparer les données pour le diagramme circulaire
  const pieData = summary.dailySummaries
    .filter(day => day.totalExpense > 0)
    .map(day => ({
      name: new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'long' }),
      value: day.totalExpense
    }));

  return (
    <div className="space-y-6">
      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Revenus de la semaine</h3>
          <p className="text-2xl font-bold text-green-600">{summary.totalIncome.toFixed(2)} €</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-800">Dépenses de la semaine</h3>
          <p className="text-2xl font-bold text-red-600">{summary.totalExpense.toFixed(2)} €</p>
        </div>
        <div className={`p-4 rounded-lg ${summary.balance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <h3 className="text-sm font-medium">Solde de la semaine</h3>
          <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summary.balance.toFixed(2)} €
          </p>
        </div>
      </div>

      {/* Diagramme circulaire des dépenses */}
      {pieData.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Répartition des dépenses par jour</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `${value.toFixed(2)} €`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Résumé journalier */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Résumé par jour</h2>
        <div className="space-y-2">
          {summary.dailySummaries.map((day) => (
            <div
              key={day.date}
              className="p-4 rounded-lg bg-white shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {new Date(day.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-sm text-green-600">+{day.totalIncome.toFixed(2)} €</p>
                    <p className="text-sm text-red-600">-{day.totalExpense.toFixed(2)} €</p>
                  </div>
                  <div className={`text-right font-bold ${
                    day.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {day.balance.toFixed(2)} €
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