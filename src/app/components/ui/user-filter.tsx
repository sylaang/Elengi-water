'use client';

import { useEffect, useState } from 'react';
import { User, X } from 'lucide-react';

type User = {
  id: number;
  name: string | null;
  email: string;
};

interface UserFilterProps {
  selectedUserId: number | null;
  onUserChange: (userId: number | null) => void;
  className?: string;
}

export function UserFilter({ selectedUserId, onUserChange, className = '' }: UserFilterProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const selectedUser = users.find(user => user.id === selectedUserId);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-pulse h-8 w-32 rounded-md"></div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <User className="w-4 h-4" />
        <span className="text-sm font-medium ">Filtrer par utilisateur :</span>
      </div>
      
      <div className="relative">
        <select
          value={selectedUserId || ''}
          onChange={(e) => {
            const value = e.target.value;
            onUserChange(value ? parseInt(value) : null);
          }}
          className="px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tous les utilisateurs</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name || user.email}
            </option>
          ))}
        </select>
      </div>

      {selectedUser && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-md text-xs">
          <span>{selectedUser.name || selectedUser.email}</span>
          <button
            onClick={() => onUserChange(null)}
            className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
            title="Supprimer le filtre"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
} 