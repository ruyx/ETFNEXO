'use client';

import Link from 'next/link';
import UserNav from './UserNav';

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__container">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <Link href="/" className="site-header__logo">
            <img src="/logo-white.svg" alt="ETF Nexo" className="site-header__logo-image" />
          </Link>

          {/* Navigation */}
          <nav className="site-header__nav">
            <Link href="/noticias" className="site-header__nav-link">
              Noticias
            </Link>
            <Link href="/entrevistas" className="site-header__nav-link">
              Entrevistas
            </Link>
            <Link href="/academia" className="site-header__nav-link">
              Academia
            </Link>
            <Link href="/rankings" className="site-header__nav-link">
              Rankings
            </Link>
            <Link href="/etfs" className="site-header__nav-link">
              ETFs
            </Link>
            <Link href="/gestoras" className="site-header__nav-link">
              Gestoras
            </Link>
          </nav>

          {/* User Navigation */}
          <div className="site-header__cta">
            <UserNav />
          </div>

          {/* Mobile Menu Button */}
          <button className="site-header__mobile-menu-button" aria-label="Abrir menú">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
