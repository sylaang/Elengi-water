'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutDashboard } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-inner">
          <div className="flex">
            <div className="navbar-brand">
              <span>Elengi Water</span>
            </div>
            <div className="navbar-links">
              <Link
                href="/"
                className={`navbar-link ${pathname === '/' ? 'navbar-link-active' : ''}`}
              >
                <Home className="navbar-icon" />
                Accueil
              </Link>
              <Link
                href="/dashboard"
                className={`navbar-link ${pathname === '/dashboard' ? 'navbar-link-active' : ''}`}
              >
                <LayoutDashboard className="navbar-icon" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}