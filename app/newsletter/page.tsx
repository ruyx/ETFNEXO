'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al suscribirse');
      }

      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Error al procesar la suscripción. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <main className="min-h-screen bg-slate-50">
        {/* Hero Section */}
        <section className="relative py-20 px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900/50 text-blue-200 text-xs font-semibold rounded-full border border-blue-700/50 mb-6">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Publicación Semanal</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Newsletter ETF Nexo
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
                Análisis semanal de los mejores ETFs, tendencias del mercado y educación financiera.
                Sin spam, sin promociones, solo información de valor.
              </p>

              {/* Email Form - Inline */}
              {!success ? (
                <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      className="flex-1 px-6 py-4 bg-white border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-lg"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg whitespace-nowrap"
                    >
                      {loading ? 'Suscribiendo...' : 'Suscribirme Gratis'}
                    </button>
                  </div>
                  {error && (
                    <p className="mt-4 text-red-400 text-sm">{error}</p>
                  )}
                  <p className="mt-4 text-xs text-slate-400">
                    Al suscribirte, aceptas nuestra{' '}
                    <Link href="/privacidad" className="text-blue-400 hover:text-blue-300 underline">
                      política de privacidad
                    </Link>
                    . Puedes cancelar en cualquier momento.
                  </p>
                </form>
              ) : (
                <div className="max-w-xl mx-auto p-8 bg-green-900/30 border-2 border-green-500/50 rounded-lg">
                  <div className="text-5xl mb-4">✓</div>
                  <h3 className="text-2xl font-bold text-white mb-2">¡Suscripción Confirmada!</h3>
                  <p className="text-slate-300">
                    Revisa tu email para confirmar la suscripción. Te enviaremos el primer newsletter el próximo lunes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* What You'll Receive */}
        <section className="py-16 px-6 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  ¿Qué Recibirás Cada Semana?
                </h2>
                <p className="text-lg text-slate-600">
                  Contenido curado y analizado por nuestro equipo. Cero ruido, máximo valor.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Benefit 1 */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Top 5 ETFs</h3>
                  <p className="text-slate-600">
                    Los ETFs mejor posicionados en nuestro ranking con análisis detallado de por qué destacan esta semana.
                  </p>
                </div>

                {/* Benefit 2 */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Tendencias del Mercado</h3>
                  <p className="text-slate-600">
                    Análisis de movimientos significativos en el mercado de ETFs y cómo pueden afectar tu cartera.
                  </p>
                </div>

                {/* Benefit 3 */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Educación Financiera</h3>
                  <p className="text-slate-600">
                    Guías prácticas sobre estrategias de inversión, diversificación y conceptos clave de ETFs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Preview */}
        <section className="py-16 px-6 bg-slate-100">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Ejemplo de Newsletter
                </h2>
                <p className="text-lg text-slate-600">
                  Así luce nuestro análisis semanal en tu bandeja de entrada
                </p>
              </div>

              {/* Mock Newsletter */}
              <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
                {/* Email Header */}
                <div className="bg-slate-900 px-8 py-6 text-center">
                  <h3 className="text-2xl font-bold text-white">
                    ETF<span className="text-blue-400">Nexo</span> Weekly
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">Semana del 2 de junio, 2026</p>
                </div>

                {/* Email Content */}
                <div className="px-8 py-8">
                  {/* Section 1 */}
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <span className="text-blue-600">🏆</span>
                      Top 5 ETFs de la Semana
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                        <div>
                          <p className="font-bold text-slate-900">iShares Core MSCI World UCITS ETF</p>
                          <p className="text-sm text-slate-600">ISIN: IE00B4L5Y983</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">94.2</p>
                          <p className="text-xs text-slate-500">ETFNexo Score</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                        <div>
                          <p className="font-bold text-slate-900">Vanguard FTSE All-World UCITS ETF</p>
                          <p className="text-sm text-slate-600">ISIN: IE00B3RBWM25</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">92.8</p>
                          <p className="text-xs text-slate-500">ETFNexo Score</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 italic">+ 3 ETFs más...</p>
                    </div>
                  </div>

                  {/* Section 2 */}
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <span className="text-emerald-600">📈</span>
                      Tendencia de la Semana
                    </h4>
                    <p className="text-slate-700 leading-relaxed mb-3">
                      Los ETFs de tecnología han mostrado un repunte del 3.2% esta semana, impulsados por resultados
                      trimestrales positivos en el sector semiconductores. Destacan especialmente los fondos con
                      exposición a inteligencia artificial y computación en la nube.
                    </p>
                    <p className="text-sm text-slate-600">
                      <strong>Implicación para inversores:</strong> Considerar rebalanceo si la exposición tecnológica
                      supera el 30% de la cartera.
                    </p>
                  </div>

                  {/* Section 3 */}
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <span className="text-amber-600">📚</span>
                      Concepto de la Semana: TER
                    </h4>
                    <p className="text-slate-700 leading-relaxed mb-3">
                      El TER (Total Expense Ratio) es el coste anual total de un ETF expresado como porcentaje.
                      Un TER del 0.20% significa que pagas 2€ al año por cada 1.000€ invertidos.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded p-4">
                      <p className="text-sm text-slate-700">
                        <strong>Ejemplo práctico:</strong> Un ETF con TER 0.07% vs 0.50% significa una diferencia de
                        430€ en costes durante 10 años con 10.000€ invertidos (sin contar rentabilidad).
                      </p>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="text-center pt-6 border-t border-slate-200">
                    <Link
                      href="/rankings"
                      className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Ver Ranking Completo →
                    </Link>
                  </div>
                </div>

                {/* Email Footer */}
                <div className="bg-slate-100 px-8 py-6 text-center border-t border-slate-200">
                  <p className="text-xs text-slate-600">
                    Este newsletter tiene carácter exclusivamente informativo y no constituye asesoramiento financiero.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16 px-6 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12">
                Únete a Nuestra Comunidad
              </h2>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div>
                  <p className="text-5xl font-bold text-blue-600 mb-2">2,400+</p>
                  <p className="text-slate-600">Suscriptores Activos</p>
                </div>
                <div>
                  <p className="text-5xl font-bold text-blue-600 mb-2">98%</p>
                  <p className="text-slate-600">Tasa de Apertura</p>
                </div>
                <div>
                  <p className="text-5xl font-bold text-blue-600 mb-2">4.8/5</p>
                  <p className="text-slate-600">Valoración Media</p>
                </div>
              </div>

              {/* Testimonials */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <p className="text-slate-700 italic mb-4">
                    "El mejor newsletter sobre ETFs en español. Información clara, sin conflictos de interés y análisis
                    realmente útiles para tomar decisiones informadas."
                  </p>
                  <p className="text-sm font-semibold text-slate-900">— Carlos M., Inversor Particular</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <p className="text-slate-700 italic mb-4">
                    "Llevo 3 meses suscrito y he aprendido más sobre ETFs que en años leyendo otros blogs.
                    La transparencia de su metodología es lo que más valoro."
                  </p>
                  <p className="text-sm font-semibold text-slate-900">— Ana R., Asesora Financiera</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 px-6 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                ¿Listo para Tomar Mejores Decisiones de Inversión?
              </h2>
              <p className="text-xl text-slate-300 mb-8">
                Únete gratis a miles de inversores que reciben nuestro análisis cada lunes.
              </p>
              <Link
                href="#top"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-block px-8 py-4 bg-white text-blue-900 font-bold rounded-lg hover:bg-slate-100 transition-all text-lg"
              >
                Suscribirme Ahora (Gratis)
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative py-12 px-6 bg-slate-900 border-t border-slate-800">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-2xl font-bold text-white">
                ETF<span className="text-blue-400">Nexo</span>
              </div>

              <nav className="flex gap-8">
                {['Inicio', 'Rankings', 'Gestoras', 'Metodología'].map((item) => (
                  <Link
                    key={item}
                    href={item === 'Inicio' ? '/' : `/${item.toLowerCase()}`}
                    className="text-sm text-slate-400 hover:text-white transition-colors uppercase tracking-wide font-medium"
                  >
                    {item}
                  </Link>
                ))}
              </nav>

              <div className="text-sm text-slate-400">
                © 2026 ETFNexo. Todos los derechos reservados.
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
