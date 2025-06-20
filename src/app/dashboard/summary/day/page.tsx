import DaySummary from '@/app/operations/summary/DaySummary';

export default function DaySummaryPage() {
  return (
    <div className="px-4 py-6 overflow-x-hidden w-full">
      <h1 className="text-2xl font-bold mb-4">Résumé du jour</h1>
      <DaySummary />
    </div>
  );
} 