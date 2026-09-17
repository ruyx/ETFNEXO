import type { Metadata } from 'next';
import { Newspaper } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Metodología | ETF Nexo',
  description: 'Cómo elaboramos la información de ETF Nexo. Criterios editoriales y proceso de creación de contenidos.',
};

export default function MetodologiaPage() {
  return (
    <div className="legal-page">
      {/* Header */}
      <div className="legal-page__header">
        <div className="legal-page__icon-wrapper legal-page__icon-wrapper--primary">
          <Newspaper className="w-8 h-8 legal-page__icon" />
        </div>
        <h1 className="legal-page__title">Metodología</h1>
        <p className="legal-page__subtitle">
          Cómo elaboramos la información de ETF Nexo
        </p>
      </div>

      {/* Content */}
      <div className="legal-page__content">
        <p>
          ETF Nexo es un medio de comunicación digital especializado en información sobre fondos cotizados (ETF), mercados, inversión y gestión de activos.
        </p>

        <p>
          Nuestro objetivo es ofrecer información clara, rigurosa y comprensible sobre la industria de los ETF y los mercados financieros. Para ello, elaboramos nuestros contenidos a partir de fuentes públicas y especializadas, documentación proporcionada por gestoras y proveedores de productos financieros, comunicados corporativos, organismos oficiales, datos de mercado y otras fuentes de información que consideramos relevantes.
        </p>

        <h2 className="legal-page__section-title">
          Criterios editoriales
        </h2>

        <p>En la elaboración de nuestros contenidos procuramos:</p>

        <ul className="legal-page__list">
          <li className="legal-page__list-item">Contrastar la información siempre que sea posible.</li>
          <li className="legal-page__list-item">Identificar las fuentes utilizadas cuando resulte relevante para el lector.</li>
          <li className="legal-page__list-item">Diferenciar los hechos y datos de las opiniones, análisis o previsiones de terceros.</li>
          <li className="legal-page__list-item">Indicar cuando una información corresponde a declaraciones o estimaciones realizadas por una empresa, gestora, analista u otra fuente.</li>
          <li className="legal-page__list-item">Mantener actualizada la información cuando su naturaleza lo requiera.</li>
        </ul>

        <p>
          Las rentabilidades, precios, patrimonio, flujos, ratios y demás datos relacionados con productos financieros pueden cambiar con el tiempo. Cuando se publiquen cifras, estas corresponderán al momento o periodo indicado en cada información.
        </p>

        <h2 className="legal-page__section-title">
          Contenido financiero
        </h2>

        <p>
          La información publicada en ETF Nexo tiene carácter exclusivamente informativo y divulgativo.
        </p>

        <p>
          Los contenidos de ETF Nexo <strong className="legal-page__emphasis">no constituyen asesoramiento financiero, recomendación personalizada de inversión, oferta, invitación a comprar o vender instrumentos financieros ni garantía de resultados futuros</strong>.
        </p>

        <p>
          Antes de tomar cualquier decisión de inversión, cada lector debe valorar su propia situación financiera, objetivos y tolerancia al riesgo y, cuando corresponda, consultar con un profesional debidamente cualificado.
        </p>
      </div>
    </div>
  );
}
