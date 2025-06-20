import MonthSummary from '@/app/operations/summary/MonthSummary';

export default function MonthSummaryPage() {
  return (
    <div className="px-4 py-6 overflow-x-hidden w-full">
      <h1 className="text-2xl font-bold mb-4">Résumé du mois</h1>
      <MonthSummary />
    </div>
  );
} 