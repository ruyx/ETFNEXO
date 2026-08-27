'use client';

/**
 * AdSenseGuide - Guía de configuración de Google AdSense
 * Sección expandible con instrucciones paso a paso
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Code, CheckCircle } from 'lucide-react';

export default function AdSenseGuide() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="adsense-guide">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="adsense-guide__toggle"
      >
        <div className="adsense-guide__toggle-left">
          <img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234285f4' stroke-width='2'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5z'/%3E%3Cpath d='M2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E"
            alt="Google AdSense"
            className="w-6 h-6"
          />
          <div>
            <h3 className="adsense-guide__title">Guía de Integración con Google AdSense</h3>
            <p className="adsense-guide__subtitle">Aprende a configurar anuncios de Google AdSense en tu sitio</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-neutral-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-neutral-500" />
        )}
      </button>

      {isExpanded && (
        <div className="adsense-guide__content">
          {/* Paso 1 */}
          <div className="adsense-guide__step">
            <div className="adsense-guide__step-number">1</div>
            <div className="adsense-guide__step-content">
              <h4 className="adsense-guide__step-title">Crear Cuenta en Google AdSense</h4>
              <p className="adsense-guide__step-text">
                Si aún no tienes una cuenta, regístrate en Google AdSense y verifica tu sitio web.
              </p>
              <a
                href="https://www.google.com/adsense/start/"
                target="_blank"
                rel="noopener noreferrer"
                className="adsense-guide__link"
              >
                <ExternalLink className="w-4 h-4" />
                Ir a Google AdSense
              </a>
            </div>
          </div>

          {/* Paso 2 */}
          <div className="adsense-guide__step">
            <div className="adsense-guide__step-number">2</div>
            <div className="adsense-guide__step-content">
              <h4 className="adsense-guide__step-title">Obtener Código del Anuncio</h4>
              <p className="adsense-guide__step-text">
                En tu panel de AdSense, crea un nuevo anuncio y copia el código generado. Asegúrate de seleccionar el tamaño apropiado para la ubicación.
              </p>
              <div className="adsense-guide__code-example">
                <Code className="w-4 h-4" />
                <pre className="adsense-guide__code">
{`<script async src="https://pagead2.googlesyndication.com/..."></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="XXXXXXXXXX"
     data-ad-format="auto"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`}
                </pre>
              </div>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="adsense-guide__step">
            <div className="adsense-guide__step-number">3</div>
            <div className="adsense-guide__step-content">
              <h4 className="adsense-guide__step-title">Crear Anuncio en el CMS</h4>
              <p className="adsense-guide__step-text">
                En este panel, crea un nuevo anuncio y:
              </p>
              <ul className="adsense-guide__checklist">
                <li>
                  <CheckCircle className="w-4 h-4" />
                  Selecciona el anunciante (puedes crear uno llamado "Google AdSense")
                </li>
                <li>
                  <CheckCircle className="w-4 h-4" />
                  Elige <strong>tipo "Script"</strong>
                </li>
                <li>
                  <CheckCircle className="w-4 h-4" />
                  Pega el código completo de AdSense en el campo "Script Code"
                </li>
                <li>
                  <CheckCircle className="w-4 h-4" />
                  Selecciona la ubicación deseada (consulta los tamaños recomendados abajo)
                </li>
                <li>
                  <CheckCircle className="w-4 h-4" />
                  Activa el anuncio
                </li>
              </ul>
            </div>
          </div>

          {/* Paso 4 */}
          <div className="adsense-guide__step">
            <div className="adsense-guide__step-number">4</div>
            <div className="adsense-guide__step-content">
              <h4 className="adsense-guide__step-title">Verificación y Optimización</h4>
              <p className="adsense-guide__step-text">
                Después de publicar, verifica que los anuncios se muestren correctamente. Google AdSense puede tardar unas horas en empezar a servir anuncios.
              </p>
              <div className="adsense-guide__tips">
                <strong>Consejos de optimización:</strong>
                <ul>
                  <li>Usa anuncios responsive para mejor rendimiento en móvil</li>
                  <li>No coloques más de 3 anuncios por página</li>
                  <li>Respeta las políticas de contenido de Google AdSense</li>
                  <li>Monitorea el rendimiento en tu panel de AdSense</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="adsense-guide__footer">
            <p>
              <strong>Nota:</strong> Los anuncios de Google AdSense se crean como tipo "Script" en este CMS.
              El código se insertará automáticamente en la ubicación seleccionada.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
