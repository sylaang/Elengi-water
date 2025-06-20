'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Category = { id: number; name: string };
type OperationType = 'income' | 'expense';

type Operation = {
  id: number;
  amount: number;
  type: OperationType;
  categoryId: number;
  description: string | null;
  date: string;
  category: {
    id: number;
    name: string;
  };
};

export default function EditOperationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [operation, setOperation] = useState<Operation | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const [form, setForm] = useState({
    amount: '',
    categoryId: 1,
    type: 'expense' as OperationType,
    description: '',
    date: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les catégories
        const categoriesRes = await fetch('/api/categories');
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);

        // Charger l'opération
        const operationRes = await fetch(`/api/operations/${params.id}`);
        if (!operationRes.ok) {
          throw new Error('Opération non trouvée');
        }
        const operationData = await operationRes.json();
        setOperation(operationData);

        // Pré-remplir le formulaire
        setForm({
          amount: operationData.amount.toString(),
          categoryId: operationData.categoryId,
          type: operationData.type,
          description: operationData.description || '',
          date: new Date(operationData.date).toISOString().split('T')[0]
        });
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        setMessage({ text: 'Erreur lors du chargement de l\'opération', isError: true });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(form.amount);
    if (isNaN(amountNum)) {
      setMessage({ text: 'Veuillez entrer un montant valide', isError: true });
      return;
    }

    if (amountNum <= 0) {
      setMessage({ text: 'Le montant doit être positif', isError: true });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/operations/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountNum,
          categoryId: Number(form.categoryId),
          type: form.type,
          description: form.description,
          date: form.date,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Échec de la mise à jour');
      }

      setMessage({
        text: '✅ Opération mise à jour avec succès',
        isError: false
      });

      // Rediriger vers la liste après 2 secondes
      setTimeout(() => {
        router.push('/dashboard/operations/list');
      }, 2000);

    } catch (error) {
      setMessage({
        text: `❌ Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}`,
        isError: true
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <p>Chargement de l'opération...</p>
        </div>
      </div>
    );
  }

  if (!operation) {
    return (
      <div className="px-4 py-6 overflow-x-hidden w-full">
        <div className="text-center py-8 w-full">
          <p className="text-red-600 mb-4">Opération non trouvée</p>
          <Link
            href="/dashboard/operations/list"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 overflow-x-hidden w-full">
      <div className="max-w-full sm:max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 w-full">
          <Link
            href="/dashboard/operations/list"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </Link>
          <h1 className="text-2xl font-bold">Modifier l'opération</h1>
        </div>

        {/* Message de feedback */}
        {message && (
          <div
            className={`p-3 rounded-md mb-6 w-full ${
              message.isError
                ? 'bg-red-50 text-red-800'
                : 'bg-green-50 text-green-800'
            }`}
          >
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow border border-gray-200">
          {/* Champ Montant */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Montant *
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Champ Catégorie */}
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie *
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              disabled={categories.length === 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.length === 0 ? (
                <option value="">Chargement des catégories...</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Champ Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="expense">Dépense</option>
              <option value="income">Revenu</option>
            </select>
          </div>

          {/* Champ Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Champ Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (facultative)
            </label>
            <input
              id="description"
              name="description"
              type="text"
              value={form.description}
              onChange={handleChange}
              placeholder="Ajouter une note..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full">
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white w-full ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {saving ? 'Mise à jour en cours...' : 'Mettre à jour'}
            </button>
            
            <Link
              href="/dashboard/operations/list"
              className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 