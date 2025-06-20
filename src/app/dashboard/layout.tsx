'use client';
import { Sidebar } from '@/app/components/layout/sidebar';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      {/* Sidebar desktop */}
      <Sidebar mobile={false} />

      {/* Bouton hamburger mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 rounded-full p-2 shadow border bg-[var(--card-bg)] border-[var(--card-border)]"
        onClick={() => setSidebarOpen(true)}
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fermer le menu"
          />
          {/* Drawer */}
          <div className="relative w-64 h-full bg-card-bg border-r border-card-border p-4 animate-slide-in-left">
            <button
              className="absolute top-4 right-4 z-50 rounded-full p-1 shadow border bg-[var(--card-bg)] border-[var(--card-border)]"
              onClick={() => setSidebarOpen(false)}
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar mobile={true} />
          </div>
        </div>
      )}

      <main className="flex-1 md:ml-64 px-4 py-8 w-full">
        {children}
      </main>
    </div>
  );
}

// Ajoute une animation simple pour le drawer
// Dans le fichier global CSS (globals.css), ajoute :
// @keyframes slide-in-left { from { transform: translateX(-100%); } to { transform: translateX(0); } }
// .animate-slide-in-left { animation: slide-in-left 0.2s ease; } 