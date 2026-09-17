import type { Metadata } from 'next';
import { FileText, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Términos y Privacidad | ETF Nexo',
  description: 'Términos y condiciones de uso y política de privacidad de ETF Nexo.',
};

export default function TerminosPrivacidadPage() {
  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--spacing-8) var(--spacing-4)' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--spacing-8)', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--color-primary-50)',
          marginBottom: 'var(--spacing-4)'
        }}>
          <FileText className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
        </div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          marginBottom: 'var(--spacing-2)',
          color: 'var(--color-neutral-900)'
        }}>
          Términos y Privacidad
        </h1>
      </div>

      {/* Content */}
      <div style={{
        fontSize: '1rem',
        lineHeight: '1.75',
        color: 'var(--color-neutral-700)'
      }}>
        {/* TÉRMINOS */}
        <section style={{ marginBottom: 'var(--spacing-10)' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: 'var(--spacing-6)',
            color: 'var(--color-neutral-900)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-2)'
          }}>
            <FileText className="w-6 h-6" />
            Términos
          </h2>

          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: 'var(--spacing-4)',
            color: 'var(--color-neutral-900)'
          }}>
            Términos y condiciones de uso
          </h3>

          <p style={{ marginBottom: 'var(--spacing-4)' }}>
            El acceso y utilización de etfnexo.com atribuye la condición de usuario e implica la aceptación de las presentes condiciones de uso.
          </p>

          <p style={{ marginBottom: 'var(--spacing-6)' }}>
            ETF Nexo se reserva el derecho a modificar, actualizar o eliminar contenidos de la web, así como las presentes condiciones, cuando resulte necesario. Las modificaciones serán aplicables desde su publicación en la web.
          </p>

          <h4 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: 'var(--spacing-3)',
            color: 'var(--color-neutral-900)'
          }}>
            Uso de los contenidos
          </h4>

          <p style={{ marginBottom: 'var(--spacing-4)' }}>
            Los contenidos publicados en ETF Nexo están destinados al uso personal e informativo de los usuarios.
          </p>

          <p style={{ marginBottom: 'var(--spacing-4)' }}>
            El usuario se compromete a utilizar la web de forma lícita y a no realizar actividades que puedan perjudicar el funcionamiento del sitio web, sus contenidos o los derechos de terceros.
          </p>

          <p style={{ marginBottom: 'var(--spacing-4)' }}>
            Los contenidos, textos, gráficos, fotografías, logotipos, diseños y demás elementos de la web están protegidos por la normativa aplicable en materia de propiedad intelectual e industrial. La propiedad intelectual de una obra corresponde a su autor por el hecho de su creación, dentro de los límites establecidos por la legislación vigente.
          </p>

          <p style={{ marginBottom: 'var(--spacing-4)' }}>
            No está permitida la reproducción, distribución, transformación o comunicación pública de los contenidos de ETF Nexo sin la autorización correspondiente, salvo en aquellos casos permitidos por la legislación aplicable.
          </p>

          <p style={{ marginBottom: 'var(--spacing-6)' }}>
            La utilización de fragmentos de contenidos con fines informativos deberá respetar en todo caso la legislación sobre propiedad intelectual y citar adecuadamente la fuente.
          </p>

          <h4 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: 'var(--spacing-3)',
            color: 'var(--color-neutral-900)'
          }}>
            Enlaces externos
          </h4>

          <p style={{ marginBottom: 'var(--spacing-4)' }}>
            ETF Nexo puede incluir enlaces a páginas web de terceros cuando puedan resultar útiles para ampliar determinada información.
          </p>

          <p>
            ETF Nexo no controla necesariamente el contenido, disponibilidad o políticas de privacidad de dichos sitios externos y no asume responsabilidad por sus contenidos o funcionamiento.
          </p>
        </section>

        {/* PRIVACIDAD */}
        <section>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: 'var(--spacing-6)',
            color: 'var(--color-neutral-900)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-2)'
          }}>
            <Shield className="w-6 h-6" />
            Privacidad
          </h2>

          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: 'var(--spacing-4)',
            color: 'var(--color-neutral-900)'
          }}>
            Política de privacidad
          </h3>

          <p style={{ marginBottom: 'var(--spacing-6)' }}>
            En ETF Nexo nos comprometemos a tratar los datos personales de los usuarios de forma responsable y de acuerdo con la normativa aplicable en materia de protección de datos, incluido el Reglamento General de Protección de Datos (RGPD) y la legislación española aplicable.
          </p>

          <h4 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: 'var(--spacing-3)',
            color: 'var(--color-neutral-900)'
          }}>
            ¿Qué datos podemos recopilar?
          </h4>

          <p style={{ marginBottom: 'var(--spacing-4)' }}>
            ETF Nexo puede recopilar los datos personales que el usuario facilite voluntariamente a través de formularios, suscripciones, comunicaciones por correo electrónico u otros mecanismos disponibles en la web.
          </p>

          <p style={{ marginBottom: 'var(--spacing-6)' }}>
            También pueden recopilarse determinados datos técnicos derivados de la navegación, como información relacionada con el dispositivo, navegador, dirección IP o interacción con la web, de acuerdo con la configuración de cookies y las tecnologías utilizadas.
          </p>

          <h4 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: 'var(--spacing-3)',
            color: 'var(--color-neutral-900)'
          }}>
            ¿Para qué utilizamos los datos?
          </h4>

          <p style={{ marginBottom: 'var(--spacing-4)' }}>
            Los datos personales podrán utilizarse, según corresponda, para:
          </p>

          <ul style={{
            marginBottom: 'var(--spacing-6)',
            paddingLeft: 'var(--spacing-6)',
            listStyleType: 'disc'
          }}>
            <li style={{ marginBottom: 'var(--spacing-2)' }}>Gestionar las consultas y comunicaciones recibidas.</li>
            <li style={{ marginBottom: 'var(--spacing-2)' }}>Gestionar suscripciones a boletines informativos, cuando exista este servicio.</li>
            <li style={{ marginBottom: 'var(--spacing-2)' }}>Mantener y mejorar el funcionamiento de la página web.</li>
            <li style={{ marginBottom: 'var(--spacing-2)' }}>Analizar el uso de la web y elaborar estadísticas.</li>
            <li style={{ marginBottom: 'var(--spacing-2)' }}>Cumplir las obligaciones legales aplicables.</li>
            <li style={{ marginBottom: 'var(--spacing-2)' }}>Enviar comunicaciones comerciales cuando exista una base jurídica válida y, cuando sea necesario, el consentimiento correspondiente.</li>
          </ul>

          <h4 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: 'var(--spacing-3)',
            color: 'var(--color-neutral-900)'
          }}>
            Derechos del usuario
          </h4>

          <p style={{ marginBottom: 'var(--spacing-4)' }}>
            El usuario puede ejercer, cuando corresponda, sus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, así como retirar su consentimiento cuando el tratamiento se base en él.
          </p>

          <p style={{ marginBottom: 'var(--spacing-4)' }}>
            Para ejercer estos derechos puede contactar con:{' '}
            <a href="mailto:soporte@etfnexo.com" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
              soporte@etfnexo.com
            </a>
          </p>

          <p>
            Asimismo, el usuario tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) si considera que el tratamiento de sus datos no se ajusta a la normativa aplicable.
          </p>
        </section>
      </div>
    </div>
  );
}
