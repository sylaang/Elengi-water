'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AdminProtectedRoute } from '@/app/components/auth/admin-protected-route';

type CategoryType = 'income' | 'expense';

type Category = {
  id: number;
  name: string;
  type: CategoryType;
  operations?: Array<{
    id: number;
    amount: number;
    type: 'income' | 'expense';
    date: string;
  }>;
};

function EditCategoryPageContent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const [form, setForm] = useState({
    name: '',
    type: 'expense' as CategoryType,
  });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/categories/${params.id}`);
        if (!response.ok) {
          throw new Error('Catégorie non trouvée');
        }
        const categoryData = await response.json();
        setCategory(categoryData);

        // Pré-remplir le formulaire
        setForm({
          name: categoryData.name,
          type: categoryData.type,
        });
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        setMessage({ text: 'Erreur lors du chargement de la catégorie', isError: true });
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setMessage({ text: 'Le nom de la catégorie est requis', isError: true });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/categories/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          type: form.type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Échec de la mise à jour');
      }

      setMessage({
        text: '✅ Catégorie mise à jour avec succès',
        isError: false
      });

      // Rediriger vers la liste après 2 secondes
      setTimeout(() => {
        router.push('/dashboard/categories');
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
          <p>Chargement de la catégorie...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="px-4 py-6 overflow-x-hidden w-full">
        <div className="text-center py-8 w-full">
          <p className="text-red-600 mb-4">Catégorie non trouvée</p>
          <Link
            href="/dashboard/categories"
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
            href="/dashboard/categories"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </Link>
          <h1 className="text-2xl font-bold">Modifier la catégorie</h1>
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

        {/* Informations sur la catégorie */}
        {category.operations && category.operations.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg w-full">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Attention</h3>
            <p className="text-sm text-yellow-700">
              Cette catégorie contient {category.operations.length} opération(s). 
              La modification peut affecter les statistiques existantes.
            </p>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow border border-gray-200">
          {/* Champ Nom */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la catégorie *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Ex: Alimentation, Transport, Salaire..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              href="/dashboard/categories"
              className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full"
            >
              Annuler
            </Link>
          </div>
        </form>

        {/* Informations */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg w-full">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Informations</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Le nom de la catégorie doit être unique</li>
            <li>• Choisissez le type selon l'usage prévu (Revenu ou Dépense)</li>
            <li>• Les modifications sont appliquées immédiatement</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  return (
    <AdminProtectedRoute>
      <EditCategoryPageContent params={params} />
    </AdminProtectedRoute>
  );
} 