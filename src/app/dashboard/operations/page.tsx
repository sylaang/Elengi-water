// app/operations/page.tsx
'use client';

import OperationForm from '@/app/components/OperationForm';
import { useEffect, useState } from 'react';

type Category = { id: number; name: string };

export default function OperationsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
      setLoading(false);
    };
    fetchCategories();
  }, []);

  if (loading) return <p>Chargement des catégories...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Nouvelle opération</h1>
      <OperationForm categories={categories} />
    </div>
  );
}
