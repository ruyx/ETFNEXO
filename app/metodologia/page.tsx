import type { Metadata } from 'next';
import { Newspaper } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Metodología | ETF Nexo',
  description: 'Cómo elaboramos la información de ETF Nexo. Criterios editoriales y proceso de creación de contenidos.',
};

export default function MetodologiaPage() {
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
          <Newspaper className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
        </div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          marginBottom: 'var(--spacing-2)',
          color: 'var(--color-neutral-900)'
        }}>
          Metodología
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: 'var(--color-neutral-600)'
        }}>
          Cómo elaboramos la información de ETF Nexo
        </p>
      </div>

      {/* Content */}
      <div style={{
        fontSize: '1rem',
        lineHeight: '1.75',
        color: 'var(--color-neutral-700)'
      }}>
        <p style={{ marginBottom: 'var(--spacing-6)' }}>
          ETF Nexo es un medio de comunicación digital especializado en información sobre fondos cotizados (ETF), mercados, inversión y gestión de activos.
        </p>

        <p style={{ marginBottom: 'var(--spacing-8)' }}>
          Nuestro objetivo es ofrecer información clara, rigurosa y comprensible sobre la industria de los ETF y los mercados financieros. Para ello, elaboramos nuestros contenidos a partir de fuentes públicas y especializadas, documentación proporcionada por gestoras y proveedores de productos financieros, comunicados corporativos, organismos oficiales, datos de mercado y otras fuentes de información que consideramos relevantes.
        </p>

        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          marginBottom: 'var(--spacing-4)',
          color: 'var(--color-neutral-900)'
        }}>
          Criterios editoriales
        </h2>

        <p style={{ marginBottom: 'var(--spacing-4)' }}>
          En la elaboración de nuestros contenidos procuramos:
        </p>

        <ul style={{
          marginBottom: 'var(--spacing-6)',
          paddingLeft: 'var(--spacing-6)',
          listStyleType: 'disc'
        }}>
          <li style={{ marginBottom: 'var(--spacing-2)' }}>Contrastar la información siempre que sea posible.</li>
          <li style={{ marginBottom: 'var(--spacing-2)' }}>Identificar las fuentes utilizadas cuando resulte relevante para el lector.</li>
          <li style={{ marginBottom: 'var(--spacing-2)' }}>Diferenciar los hechos y datos de las opiniones, análisis o previsiones de terceros.</li>
          <li style={{ marginBottom: 'var(--spacing-2)' }}>Indicar cuando una información corresponde a declaraciones o estimaciones realizadas por una empresa, gestora, analista u otra fuente.</li>
          <li style={{ marginBottom: 'var(--spacing-2)' }}>Mantener actualizada la información cuando su naturaleza lo requiera.</li>
        </ul>

        <p style={{ marginBottom: 'var(--spacing-8)' }}>
          Las rentabilidades, precios, patrimonio, flujos, ratios y demás datos relacionados con productos financieros pueden cambiar con el tiempo. Cuando se publiquen cifras, estas corresponderán al momento o periodo indicado en cada información.
        </p>

        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          marginBottom: 'var(--spacing-4)',
          color: 'var(--color-neutral-900)'
        }}>
          Contenido financiero
        </h2>

        <p style={{ marginBottom: 'var(--spacing-4)' }}>
          La información publicada en ETF Nexo tiene carácter exclusivamente informativo y divulgativo.
        </p>

        <p style={{ marginBottom: 'var(--spacing-4)' }}>
          Los contenidos de ETF Nexo <strong>no constituyen asesoramiento financiero, recomendación personalizada de inversión, oferta, invitación a comprar o vender instrumentos financieros ni garantía de resultados futuros</strong>.
        </p>

        <p>
          Antes de tomar cualquier decisión de inversión, cada lector debe valorar su propia situación financiera, objetivos y tolerancia al riesgo y, cuando corresponda, consultar con un profesional debidamente cualificado.
        </p>
      </div>
    </div>
  );
}
