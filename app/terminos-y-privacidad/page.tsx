import type { Metadata } from 'next';
import { FileText, Shield } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Términos y Privacidad | ETF Nexo',
  description: 'Términos y condiciones de uso y política de privacidad de ETF Nexo.',
};

// Force dynamic rendering to bypass Vercel's prerender cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function TerminosPrivacidadPage() {
  return (
    <>
      <Header />
      <div className="legal-page">
      {/* Header */}
      <div className="legal-page__header">
        <div className="legal-page__icon-wrapper legal-page__icon-wrapper--primary">
          <FileText className="w-8 h-8 legal-page__icon" />
        </div>
        <h1 className="legal-page__title">Términos y Privacidad</h1>
      </div>

      {/* Content */}
      <div className="legal-page__content">
        {/* TÉRMINOS */}
        <section className="legal-page__section">
          <h2 className="legal-page__section-header">
            <FileText className="w-6 h-6" />
            Términos
          </h2>

          <h3 className="legal-page__section-title">
            Términos y condiciones de uso
          </h3>

          <p>
            El acceso y utilización de etfnexo.com atribuye la condición de usuario e implica la aceptación de las presentes condiciones de uso.
          </p>

          <p>
            ETF Nexo se reserva el derecho a modificar, actualizar o eliminar contenidos de la web, así como las presentes condiciones, cuando resulte necesario. Las modificaciones serán aplicables desde su publicación en la web.
          </p>

          <h4 className="legal-page__subsection-title">
            Uso de los contenidos
          </h4>

          <p>
            Los contenidos publicados en ETF Nexo están destinados al uso personal e informativo de los usuarios.
          </p>

          <p>
            El usuario se compromete a utilizar la web de forma lícita y a no realizar actividades que puedan perjudicar el funcionamiento del sitio web, sus contenidos o los derechos de terceros.
          </p>

          <p>
            Los contenidos, textos, gráficos, fotografías, logotipos, diseños y demás elementos de la web están protegidos por la normativa aplicable en materia de propiedad intelectual e industrial. La propiedad intelectual de una obra corresponde a su autor por el hecho de su creación, dentro de los límites establecidos por la legislación vigente.
          </p>

          <p>
            No está permitida la reproducción, distribución, transformación o comunicación pública de los contenidos de ETF Nexo sin la autorización correspondiente, salvo en aquellos casos permitidos por la legislación aplicable.
          </p>

          <p>
            La utilización de fragmentos de contenidos con fines informativos deberá respetar en todo caso la legislación sobre propiedad intelectual y citar adecuadamente la fuente.
          </p>

          <h4 className="legal-page__subsection-title">
            Enlaces externos
          </h4>

          <p>
            ETF Nexo puede incluir enlaces a páginas web de terceros cuando puedan resultar útiles para ampliar determinada información.
          </p>

          <p>
            ETF Nexo no controla necesariamente el contenido, disponibilidad o políticas de privacidad de dichos sitios externos y no asume responsabilidad por sus contenidos o funcionamiento.
          </p>
        </section>

        {/* PRIVACIDAD */}
        <section className="legal-page__section">
          <h2 className="legal-page__section-header">
            <Shield className="w-6 h-6" />
            Privacidad
          </h2>

          <h3 className="legal-page__section-title">
            Política de privacidad
          </h3>

          <p>
            En ETF Nexo nos comprometemos a tratar los datos personales de los usuarios de forma responsable y de acuerdo con la normativa aplicable en materia de protección de datos, incluido el Reglamento General de Protección de Datos (RGPD) y la legislación española aplicable.
          </p>

          <h4 className="legal-page__subsection-title">
            ¿Qué datos podemos recopilar?
          </h4>

          <p>
            ETF Nexo puede recopilar los datos personales que el usuario facilite voluntariamente a través de formularios, suscripciones, comunicaciones por correo electrónico u otros mecanismos disponibles en la web.
          </p>

          <p>
            También pueden recopilarse determinados datos técnicos derivados de la navegación, como información relacionada con el dispositivo, navegador, dirección IP o interacción con la web, de acuerdo con la configuración de cookies y las tecnologías utilizadas.
          </p>

          <h4 className="legal-page__subsection-title">
            ¿Para qué utilizamos los datos?
          </h4>

          <p>Los datos personales podrán utilizarse, según corresponda, para:</p>

          <ul className="legal-page__list">
            <li className="legal-page__list-item">Gestionar las consultas y comunicaciones recibidas.</li>
            <li className="legal-page__list-item">Gestionar suscripciones a boletines informativos, cuando exista este servicio.</li>
            <li className="legal-page__list-item">Mantener y mejorar el funcionamiento de la página web.</li>
            <li className="legal-page__list-item">Analizar el uso de la web y elaborar estadísticas.</li>
            <li className="legal-page__list-item">Cumplir las obligaciones legales aplicables.</li>
            <li className="legal-page__list-item">Enviar comunicaciones comerciales cuando exista una base jurídica válida y, cuando sea necesario, el consentimiento correspondiente.</li>
          </ul>

          <h4 className="legal-page__subsection-title">
            Derechos del usuario
          </h4>

          <p>
            El usuario puede ejercer, cuando corresponda, sus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, así como retirar su consentimiento cuando el tratamiento se base en él.
          </p>

          <p>
            Para ejercer estos derechos puede contactar con:{' '}
            <a href="mailto:soporte@etfnexo.com" className="legal-page__link">
              soporte@etfnexo.com
            </a>
          </p>

          <p>
            Asimismo, el usuario tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) si considera que el tratamiento de sus datos no se ajusta a la normativa aplicable.
          </p>
        </section>
      </div>
    </div>
    <Footer />
    </>
  );
}
