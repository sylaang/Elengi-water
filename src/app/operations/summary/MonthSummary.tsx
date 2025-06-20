'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { User } from 'lucide-react';
import { useAuth } from '@/app/providers/auth-provider';
import { UserFilter } from '@/app/components/ui/user-filter';
import { DownloadSummaryButton } from '@/app/components/ui/DownloadSummaryButton';


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
    operations: Array<{
      id: number;
      amount: number;
      type: 'income' | 'expense';
      description: string;
      date: string;
      category: {
        id: number;
        name: string;
      };
      user?: {
        id: number;
        name: string | null;
        email: string;
      };
    }>;
  }>;
  isAdmin?: boolean;
  totalOperations?: number;
  filteredByUser?: number | null;
  operations?: Operation[];
};

type Operation = {
  date: string;
  description: string;
  amount: number;
  type: string;
  user?: string;      // juste le nom ou identifiant simplifié
  category?: string;  // juste le nom simplifié
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'];

export default function MonthSummary() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const toggleWeek = (weekStart: string) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekStart)) {
      newExpanded.delete(weekStart);
    } else {
      newExpanded.add(weekStart);
    }
    setExpandedWeeks(newExpanded);
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedUserId]);

  const fetchSummary = async () => {
    try {
      const url = new URL('/api/operations/summary/month', window.location.origin);
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

  // Préparer les données pour le diagramme circulaire
  const pieData = summary.weeklySummaries
    .filter(week => week.totalExpense > 0)
    .map((week, index) => ({
      name: `Semaine ${index + 1}`,
      value: week.totalExpense
    }));

  return (
    <div className="space-y-6">
      {/* Filtre utilisateur (admin uniquement) */}
      {user?.role === 'ADMIN' && (
        <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]">
          <UserFilter
            selectedUserId={selectedUserId}
            onUserChange={setSelectedUserId}
          />
        </div>
      )}

      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]">
          <h3 className="text-sm font-medium text-green-800">
            {summary.isAdmin ? 'Revenus totaux du mois' : 'Revenus du mois'}
          </h3>
          <p className="text-2xl font-bold text-green-600">{summary.totalIncome.toFixed(2)} €</p>
          {summary.isAdmin && summary.totalOperations && (
            <p className="text-xs text-green-600 mt-1">
              {summary.totalOperations} opération(s)
            </p>
          )}
        </div>
        <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]">
          <h3 className="text-sm font-medium text-red-800">
            {summary.isAdmin ? 'Dépenses totales du mois' : 'Dépenses du mois'}
          </h3>
          <p className="text-2xl font-bold text-red-600">{summary.totalExpense.toFixed(2)} €</p>
        </div>
        <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]">
          <h3 className="text-sm font-medium">
            {summary.isAdmin ? 'Solde total du mois' : 'Solde du mois'}
          </h3>
          <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summary.balance.toFixed(2)} €
          </p>
        </div>
      </div>

      {/* Bouton téléchargement Excel */}
      {summary.operations && summary.operations.length > 0 ? (
        <div className="mt-6">
          <DownloadSummaryButton summaryType="month" summaryData={summary.operations} />
        </div>
      ) : (
        <div className="mt-6 flex items-center gap-2 opacity-50 cursor-not-allowed">
          <button disabled className="px-4 py-2 bg-gray-300 rounded text-gray-600" style={{ pointerEvents: 'none' }}>
            Télécharger le résumé (Excel)
          </button>
          <span className="text-sm text-gray-500">Aucune opération à exporter ce mois-ci</span>
        </div>
      )}

      {/* Diagramme circulaire des dépenses */}
      {pieData.length > 0 && (
        <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] shadow">
          <h2 className="text-lg font-semibold mb-4">
            {summary.isAdmin ? 'Répartition des dépenses totales par semaine' : 'Répartition des dépenses par semaine'}
          </h2>
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

      {/* Résumé hebdomadaire */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          {summary.isAdmin ? 'Résumé total par semaine' : 'Résumé par semaine'}
        </h2>
        <div className="space-y-2">
          {summary.weeklySummaries.map((week) => (
            <div
              key={week.weekStart}
              className="rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] shadow overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleWeek(week.weekStart)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      Semaine du {new Date(week.weekStart).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long'
                      })} au {new Date(week.weekEnd).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long'
                      })}
                    </p>
                    <span className="text-gray-500">
                      {expandedWeeks.has(week.weekStart) ? '▼' : '▶'}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <p className="text-sm text-green-600">+{week.totalIncome.toFixed(2)} €</p>
                      <p className="text-sm text-red-600">-{week.totalExpense.toFixed(2)} €</p>
                    </div>
                    <div className={`text-right font-bold ${week.balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {week.balance.toFixed(2)} €
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu déroulant avec les détails */}
              {expandedWeeks.has(week.weekStart) && (
                <div className="border-t border-[var(--card-border)] p-4 bg-[var(--card-bg)]">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    {summary.isAdmin ? 'Toutes les opérations de la semaine' : 'Opérations de la semaine'}
                  </h3>
                  <div className="space-y-2">
                    {week.operations.length > 0 ? (
                      week.operations.map((operation) => (
                        <div
                          key={operation.id}
                          className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-sm">
                                  {operation.category.name}
                                </p>
                                {/* Afficher l'utilisateur si on est admin et qu'aucun filtre n'est appliqué */}
                                {summary.isAdmin && operation.user && !selectedUserId && (
                                  <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <User className="w-3 h-3" />
                                    <span>{operation.user.name || operation.user.email}</span>
                                  </div>
                                )}
                              </div>
                              {operation.description && (
                                <p className="text-xs text-gray-600">
                                  {operation.description}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                {new Date(operation.date).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })} à {new Date(operation.date).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <p className={`font-bold text-sm ${operation.type === 'income' ? 'text-green-600' : 'text-red-600'
                              }`}>
                              {operation.type === 'income' ? '+' : '-'}{operation.amount.toFixed(2)} €
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">Aucune opération pour cette semaine</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 