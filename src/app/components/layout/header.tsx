'use client';

import ThemeToggle from '@/app/components/ui/ThemeToggle';

export function Header() {
  return (
    <header className="fixed top-0 right-0 p-4 z-50">
      <ThemeToggle />
    </header>
  );
} 