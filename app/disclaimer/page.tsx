import type { Metadata } from 'next';
import { AlertTriangle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Disclaimer - Aviso de Responsabilidad | ETF Nexo',
  description: 'Aviso de responsabilidad y limitaciones de la información publicada en ETF Nexo.',
};

// Force dynamic rendering to bypass Vercel's prerender cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DisclaimerPage() {
  return (
    <>
      <Header />
      <div className="legal-page">
      {/* Header */}
      <div className="legal-page__header">
        <div className="legal-page__icon-wrapper legal-page__icon-wrapper--warning">
          <AlertTriangle className="w-8 h-8 legal-page__icon legal-page__icon--warning" />
        </div>
        <h1 className="legal-page__title">Disclaimer</h1>
        <p className="legal-page__subtitle">
          Aviso de responsabilidad
        </p>
      </div>

      {/* Content */}
      <div className="legal-page__content">
        <p>
          ETFNexo.com es un medio de información, análisis y educación financiera especializado en ETFs y otros instrumentos de inversión.
        </p>

        <p>
          <strong className="legal-page__emphasis">Los contenidos publicados en este sitio web tienen exclusivamente carácter informativo, divulgativo y educativo</strong> y no constituyen, en ningún caso, asesoramiento financiero, recomendación de inversión, oferta, invitación o solicitud para comprar, vender o mantener valores, ETFs, fondos de inversión u otros instrumentos financieros, ni para adoptar una determinada estrategia de inversión.
        </p>

        <p>
          La información, opiniones, análisis, ejemplos y estimaciones publicados por ETFNexo.com reflejan el criterio de sus autores en el momento de su elaboración y pueden cambiar en función de la evolución de los mercados, de las condiciones económicas y de cualquier otra circunstancia relevante. <strong className="legal-page__emphasis">ETFNexo.com no se compromete a actualizar de forma permanente los contenidos publicados ni garantiza que la información continúe siendo válida en una fecha posterior a su publicación</strong>.
        </p>

        <p>
          Los contenidos pueden basarse tanto en información propia como en datos procedentes de fuentes públicas, proveedores de información, entidades financieras, gestoras, emisores y otros terceros. Aunque ETFNexo.com procura utilizar fuentes que considera fiables y mantener unos estándares razonables de calidad editorial, <strong className="legal-page__emphasis">no garantiza la exactitud, integridad, actualidad o fiabilidad de toda la información publicada</strong> y no asume responsabilidad por posibles errores, omisiones o inexactitudes.
        </p>

        <p>
          <strong className="legal-page__emphasis">Las referencias a determinados ETFs, fondos, índices, compañías, gestoras, productos o estrategias de inversión no deben interpretarse como una recomendación de inversión ni como una garantía sobre su comportamiento futuro</strong>. La inclusión de un producto o entidad en un contenido responde a criterios editoriales, informativos o educativos y no implica necesariamente una valoración positiva del mismo.
        </p>

        <p>
          <strong className="legal-page__emphasis">La rentabilidad obtenida en el pasado no constituye un indicador fiable de resultados futuros</strong>. El valor de las inversiones puede subir o bajar y existe el riesgo de pérdida parcial o total del capital invertido. Algunos instrumentos financieros pueden implicar riesgos adicionales, como riesgo de mercado, divisa, liquidez, crédito, contraparte o seguimiento del índice, entre otros.
        </p>

        <p>
          Antes de tomar cualquier decisión de inversión, el lector debe analizar su situación financiera, objetivos de inversión, horizonte temporal y tolerancia al riesgo y, cuando resulte necesario, consultar con un profesional financiero debidamente cualificado e independiente.
        </p>

        <p>
          <strong className="legal-page__emphasis">El acceso y uso de la información publicada en ETFNexo.com queda bajo la responsabilidad exclusiva del usuario</strong>. ETFNexo.com, sus colaboradores, autores, directivos, empleados o agentes no serán responsables de las decisiones de inversión que puedan adoptarse basándose, directa o indirectamente, en los contenidos publicados en este sitio web.
        </p>

        <p>
          Asimismo, algunos contenidos de ETFNexo.com pueden incluir <strong className="legal-page__emphasis">contenidos patrocinados, colaboraciones comerciales, branded content, enlaces de afiliación o información proporcionada por terceros</strong>. Cuando corresponda, este tipo de contenidos será identificado de forma clara de acuerdo con los criterios editoriales y la normativa aplicable. La existencia de una relación comercial no debe interpretarse como una recomendación personalizada de inversión.
        </p>

        <p>
          Los contenidos de ETFNexo.com tienen como finalidad <strong className="legal-page__emphasis">ayudar al lector a comprender mejor el funcionamiento de los ETFs y de los mercados financieros</strong>, pero no sustituyen la lectura de la documentación legal y financiera correspondiente a cada producto, incluyendo, cuando resulte aplicable, su folleto, Documento de Datos Fundamentales (KID/KIID), información sobre riesgos y demás documentación oficial del emisor o proveedor.
        </p>

        <p>
          <strong className="legal-page__emphasis">La decisión de confiar en la información publicada en ETFNexo.com corresponde exclusivamente al lector</strong>. Cada inversor debe realizar su propia evaluación antes de tomar una decisión de inversión.
        </p>
      </div>
    </div>
    <Footer />
    </>
  );
}
