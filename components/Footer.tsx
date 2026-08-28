import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-12 px-6 bg-white border-t border-slate-200">
      <div className="container max-w-7xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="text-2xl font-bold text-slate-900 mb-4">
              ETF<span className="text-blue-600">Nexo</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Información transparente y análisis independiente sobre ETFs para inversores inteligentes
            </p>
          </div>

          {/* Noticias */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Noticias</h4>
            <ul className="space-y-2">
              {['ETFs', 'Gestoras', 'Mercados', 'Regulación'].map((item) => (
                <li key={item}>
                  <Link href={`/noticias?categoria=${item.toLowerCase()}`} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Herramientas */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Herramientas</h4>
            <ul className="space-y-2">
              {['Rankings', 'Buscador ETFs', 'Comparador', 'Newsletter'].map((item) => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase().replace(' ', '-')}`} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2">
              {['Metodología', 'Términos', 'Privacidad', 'Disclaimer'].map((item) => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase()}`} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © 2026 ETFNexo. Todos los derechos reservados.
          </p>
          <p className="text-xs text-slate-400 max-w-2xl text-center md:text-right">
            ETF Nexo es una plataforma informativa. No prestamos servicios de inversión ni asesoramiento financiero regulado.
          </p>
        </div>
      </div>
    </footer>
  );
}
