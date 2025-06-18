'use client';

import { useState } from 'react';

type Category = { id: number; name: string };
type OperationType = 'income' | 'expense';

export default function OperationForm({ categories }: { categories: Category[] }) {
    const [form, setForm] = useState({
        amount: '',
        categoryId: categories[0]?.id ?? 1,
        type: 'expense' as OperationType,
        description: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

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

        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/operations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amountNum,
                    categoryId: Number(form.categoryId),
                    type: form.type,
                    description: form.description,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Échec de l\'enregistrement');
            }

            setMessage({
                text: '✅ Opération enregistrée avec succès',
                isError: false
            });

            // Réinitialisation du formulaire
            setForm({
                amount: '',
                categoryId: categories[0]?.id ?? 1,
                type: 'expense',
                description: ''
            });

        } catch (error) {
            setMessage({
                text: `❌ Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}`,
                isError: true
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4">
            {/* Champ Montant */}
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
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
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
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
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
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

            {/* Champ Description */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
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

            {/* Bouton de soumission */}
            <button
                type="submit"
                disabled={loading || categories.length === 0}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading || categories.length === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
            >
                {loading ? 'Enregistrement en cours...' : 'Enregistrer'}
            </button>

            {/* Message de feedback */}
            {message && (
                <div
                    className={`p-3 rounded-md ${message.isError
                            ? 'bg-red-50 text-red-800'
                            : 'bg-green-50 text-green-800'
                        }`}
                >
                    <p className="text-sm">{message.text}</p>
                </div>
            )}
        </form>
    );
}