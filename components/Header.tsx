'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserNav from './UserNav';

const NAV_LINKS = [
  { href: '/noticias', label: 'Noticias' },
  { href: '/academia', label: 'Academia' },
  { href: '/entrevistas', label: 'Entrevistas' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/etfs', label: 'ETFs' },
  { href: '/gestoras', label: 'Gestoras' },
] as const;

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Cerrar el drawer con Escape
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobileMenu();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <header className="site-header">
      <div className="site-header__container">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <Link href="/" className="site-header__logo" aria-label="ETF Nexo, inicio">
            <img src="/logo-white.svg" alt="ETF Nexo" className="site-header__logo-image" width={160} height={48} />
          </Link>

          {/* Navegación escritorio */}
          <nav className="site-header__nav" aria-label="Principal">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`site-header__nav-link${isActive(href) ? ' site-header__nav-link--active' : ''}`}
                aria-current={isActive(href) ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* CTA + usuario */}
          <div className="site-header__cta">
            <Link href="/rankings" className="site-header__cta-button">
              Ver Rankings
            </Link>
            <UserNav />
          </div>

          {/* Botón menú móvil */}
          <button
            type="button"
            className="site-header__mobile-menu-button"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileMenuOpen}
            aria-controls="site-mobile-nav"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Drawer móvil */}
      {mobileMenuOpen && (
        <>
          <div className="site-header__mobile-backdrop" onClick={closeMobileMenu} aria-hidden="true" />

          <nav id="site-mobile-nav" className="site-header__mobile-nav" aria-label="Menú móvil">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="site-header__mobile-nav-link"
                aria-current={isActive(href) ? 'page' : undefined}
                onClick={closeMobileMenu}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/rankings"
              className="site-header__cta-button site-header__mobile-nav-cta"
              onClick={closeMobileMenu}
            >
              Ver Rankings
            </Link>
          </nav>
        </>
      )}
    </header>
  );
}
