'use client';

/**
 * Debug page para verificar cookies y sesión
 */

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DebugCookiesPage() {
  const [cookies, setCookies] = useState<string[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Obtener todas las cookies
      const allCookies = document.cookie.split('; ');
      setCookies(allCookies);

      // Obtener sesión de Supabase
      const supabase = createClient();
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Cargando...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Debug: Cookies y Sesión</h1>

        {/* Sesión de Supabase */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Sesión de Supabase</h2>
          {session ? (
            <div className="space-y-2">
              <p className="text-green-600 font-semibold">✅ Sesión activa</p>
              <div className="bg-slate-100 p-4 rounded text-sm font-mono">
                <p><strong>User ID:</strong> {session.user.id}</p>
                <p><strong>Email:</strong> {session.user.email}</p>
                <p><strong>Access Token (primeros 20 chars):</strong> {session.access_token.substring(0, 20)}...</p>
                <p><strong>Expires at:</strong> {new Date(session.expires_at! * 1000).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-red-600 font-semibold">❌ No hay sesión activa</p>
              <p className="text-sm text-slate-600 mt-2">
                Ve a <a href="/login" className="text-blue-600 underline">/login</a> para iniciar sesión
              </p>
            </div>
          )}
        </div>

        {/* Cookies */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Cookies del Navegador</h2>
          <p className="text-sm text-slate-600 mb-4">Total: {cookies.length} cookies</p>

          {/* Filtrar cookies de Supabase */}
          {(() => {
            const supabaseCookies = cookies.filter(c =>
              c.includes('supabase') || c.includes('sb-')
            );

            return (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-700 mb-2">
                    Cookies de Supabase ({supabaseCookies.length})
                  </h3>
                  {supabaseCookies.length > 0 ? (
                    <div className="bg-green-50 border border-green-200 p-4 rounded space-y-1">
                      {supabaseCookies.map((cookie, i) => {
                        const [name, value] = cookie.split('=');
                        return (
                          <div key={i} className="font-mono text-xs">
                            <span className="font-semibold text-green-700">{name}:</span>
                            <span className="text-slate-600 ml-2">
                              {value ? `${value.substring(0, 30)}${value.length > 30 ? '...' : ''}` : '(vacío)'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 p-4 rounded">
                      <p className="text-red-700 text-sm">
                        ❌ No se encontraron cookies de Supabase
                      </p>
                      <p className="text-sm text-slate-600 mt-2">
                        Esto significa que el login no está guardando las cookies correctamente.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-slate-700 mb-2">
                    Todas las Cookies
                  </h3>
                  <div className="bg-slate-50 p-4 rounded max-h-60 overflow-y-auto">
                    {cookies.map((cookie, i) => {
                      const [name] = cookie.split('=');
                      return (
                        <div key={i} className="font-mono text-xs text-slate-600 py-1">
                          {name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Acciones */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Acciones</h2>
          <div className="flex gap-4">
            <a
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ir a Login
            </a>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700"
            >
              Refrescar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
