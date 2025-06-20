'use client';

import { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { AdminProtectedRoute } from '@/app/components/auth/admin-protected-route';

type Category = {
  id: number;
  name: string;
  type: 'income' | 'expense';
  operations?: Array<{
    id: number;
    amount: number;
    type: 'income' | 'expense';
    date: string;
  }>;
};

function CategoriesPageContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      setMessage({ text: 'Erreur lors du chargement des catégories', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      setMessage({ text: '✅ Catégorie supprimée avec succès', isError: false });
      fetchCategories(); // Recharger la liste
    } catch (error) {
      setMessage({
        text: `❌ Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}`,
        isError: true
      });
    }
  };

  const handleEdit = (categoryId: number) => {
    // Rediriger vers la page d'édition
    window.location.href = `/dashboard/categories/edit/${categoryId}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <p>Chargement des catégories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 overflow-x-hidden w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 w-full">
        <h1 className="text-2xl font-bold">Gestion des Catégories</h1>
        <Link
          href="/dashboard/categories/create"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          Nouvelle catégorie
        </Link>
      </div>

      {/* Message de feedback */}
      {message && (
        <div
          className={`p-3 rounded-md mb-4 w-full ${
            message.isError
              ? 'bg-red-50 text-red-800'
              : 'bg-green-50 text-green-800'
          }`}
        >
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="text-center py-8 w-full">
          <p className="text-gray-500">Aucune catégorie trouvée</p>
          <Link
            href="/dashboard/categories/create"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Créer votre première catégorie
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {categories.map((category) => (
            <div
              key={category.id}
              className="p-4 rounded-lg bg-white shadow border border-gray-200 w-full"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  {category.type === 'income' ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                </div>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(category.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  category.type === 'income' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {category.type === 'income' ? 'Revenu' : 'Dépense'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <AdminProtectedRoute>
      <CategoriesPageContent />
    </AdminProtectedRoute>
  );
} 