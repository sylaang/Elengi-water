import WeekSummary from '@/app/operations/summary/WeekSummary';

export default function WeekSummaryPage() {
  return (
    <div className="px-4 py-6 overflow-x-hidden w-full">
      <h1 className="text-2xl font-bold mb-4">Résumé de la semaine</h1>
      <WeekSummary />
    </div>
  );
} 