import Link from 'next/link';

const FOOTER_COLUMNS = [
  {
    title: 'Noticias',
    links: [
      { href: '/noticias?categoria=etfs', label: 'ETFs' },
      { href: '/noticias?categoria=gestoras', label: 'Gestoras' },
      { href: '/noticias?categoria=mercados', label: 'Mercados' },
      { href: '/noticias?categoria=regulación', label: 'Regulación' },
    ],
  },
  {
    title: 'Herramientas',
    links: [
      { href: '/rankings', label: 'Rankings' },
      { href: '/etfs', label: 'Buscador ETFs' },
      { href: '/academia', label: 'Academia' },
      { href: '/newsletter', label: 'Newsletter' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/metodologia', label: 'Metodología' },
      { href: '/terminos-y-privacidad', label: 'Términos y Privacidad' },
      { href: '/disclaimer', label: 'Disclaimer' },
    ],
  },
];

const LINK_CLASS = 'text-sm text-white/70 hover:text-primary transition-colors';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white/70 border-t border-white/[0.08]">
      <div className="container max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-12 mb-12">
          {/* Marca */}
          <div>
            <Link href="/" className="inline-block font-heading text-3xl font-bold text-white mb-4" aria-label="ETF Nexo, inicio">
              ETF<span className="text-primary">Nexo</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Información transparente y análisis independiente sobre ETFs para inversores inteligentes.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h2 className="font-body text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {column.title}
              </h2>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={LINK_CLASS}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/[0.08] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/50">
            © {currentYear} ETFNexo. Todos los derechos reservados.
          </p>
          <p className="text-xs text-white/40 max-w-2xl text-center md:text-right">
            ETF Nexo es una plataforma informativa. No prestamos servicios de inversión ni asesoramiento financiero regulado.
          </p>
        </div>
      </div>
    </footer>
  );
}
