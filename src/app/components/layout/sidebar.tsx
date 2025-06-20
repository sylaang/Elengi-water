'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  LogOut,
  User,
  Wallet,
  Calendar,
  CalendarDays,
  CalendarRange,
  List,
  Tag
} from 'lucide-react';
import { useAuth } from '@/app/providers/auth-provider';

export function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN';

  const adminLinks = [
    {
      href: '/dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard
    },
    {
      href: '/dashboard/operations',
      label: 'Nouvelle opération',
      icon: Wallet
    },
    {
      href: '/dashboard/operations/list',
      label: 'Liste des opérations',
      icon: List
    },
    {
      href: '/dashboard/categories',
      label: 'Gestion des catégories',
      icon: Tag
    },
    {
      href: '/dashboard/summary/day',
      label: 'Résumé du jour',
      icon: Calendar
    },
    {
      href: '/dashboard/summary/week',
      label: 'Résumé de la semaine',
      icon: CalendarDays
    },
    {
      href: '/dashboard/summary/month',
      label: 'Résumé du mois',
      icon: CalendarRange
    },
    {
      href: '/dashboard/users',
      label: 'Liste des utilisateurs',
      icon: Users
    },
    {
      href: '/dashboard/create-user',
      label: 'Créer un utilisateur',
      icon: UserPlus
    }
  ];

  const userLinks = [
    {
      href: '/dashboard/user',
      label: 'Tableau de bord',
      icon: LayoutDashboard
    },
    {
      href: '/dashboard/operations',
      label: 'Nouvelle opération',
      icon: Wallet
    },
    {
      href: '/dashboard/operations/list',
      label: 'Liste des opérations',
      icon: List
    },
    {
      href: '/dashboard/summary/day',
      label: 'Résumé du jour',
      icon: Calendar
    },
    {
      href: '/dashboard/summary/week',
      label: 'Résumé de la semaine',
      icon: CalendarDays
    },
    {
      href: '/dashboard/summary/month',
      label: 'Résumé du mois',
      icon: CalendarRange
    },
    {
      href: '/dashboard/user/profile',
      label: 'Mon profil',
      icon: User
    }
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <div className={`${mobile ? 'block md:hidden' : 'hidden md:block'} w-64 h-screen fixed left-0 top-0 p-4 z-50 bg-[var(--card-bg)] border-r border-[var(--card-border)]`}>
      <div className="mb-8">
        <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
          Elengi Water
        </h1>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary text-white' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-2 px-4 py-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </Link>
      </div>
    </div>
  );
} 