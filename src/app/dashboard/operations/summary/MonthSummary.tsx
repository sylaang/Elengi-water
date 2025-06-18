// app/operations/summary/MonthSummary.tsx
'use client';

import { useEffect, useState } from 'react';

type SummaryData = {
  totalIncome: number;
  totalExpense: number;
};

export default function MonthSummary() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/operations/summary?period=month')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Chargement du résumé du mois...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Résumé du mois</h2>
      <p>Total des revenus : {data?.totalIncome.toFixed(2)} €</p>
      <p>Total des dépenses : {data?.totalExpense.toFixed(2)} €</p>
    </div>
  );
}
