'use client';

import { useState } from 'react';
import Link from 'next/link';
import UserNav from './UserNav';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="site-header__container">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <Link href="/" className="site-header__logo">
            <img src="/logo-white.svg" alt="ETF Nexo" className="site-header__logo-image" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="site-header__nav">
            <Link href="/noticias" className="site-header__nav-link">
              Noticias
            </Link>
            <Link href="/academia" className="site-header__nav-link">
              Academia
            </Link>
            <Link href="/entrevistas" className="site-header__nav-link">
              Entrevistas
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
          <button
            className="site-header__mobile-menu-button"
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="site-header__mobile-backdrop"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />

          {/* Mobile Navigation */}
          <nav className="site-header__mobile-nav">
            <Link
              href="/noticias"
              className="site-header__mobile-nav-link"
              onClick={closeMobileMenu}
            >
              Noticias
            </Link>
            <Link
              href="/academia"
              className="site-header__mobile-nav-link"
              onClick={closeMobileMenu}
            >
              Academia
            </Link>
            <Link
              href="/entrevistas"
              className="site-header__mobile-nav-link"
              onClick={closeMobileMenu}
            >
              Entrevistas
            </Link>
            <Link
              href="/rankings"
              className="site-header__mobile-nav-link"
              onClick={closeMobileMenu}
            >
              Rankings
            </Link>
            <Link
              href="/etfs"
              className="site-header__mobile-nav-link"
              onClick={closeMobileMenu}
            >
              ETFs
            </Link>
            <Link
              href="/gestoras"
              className="site-header__mobile-nav-link"
              onClick={closeMobileMenu}
            >
              Gestoras
            </Link>
          </nav>
        </>
      )}
    </header>
  );
}
