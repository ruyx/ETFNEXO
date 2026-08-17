'use client';

/**
 * ArticleFAQ - Resumen Exprés con FAQPage schema.org
 * Renderizado en servidor + popup flotante para UX
 */

import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface ArticleFAQProps {
  faqs: FAQ[];
  articleTitle: string;
}

export default function ArticleFAQ({ faqs, articleTitle }: ArticleFAQProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!faqs || faqs.length === 0) {
    return null;
  }

  // Generate FAQPage schema.org
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Contenido renderizado en el DOM (hidden accordion) */}
      <details className="article-faq-accordion" itemScope itemType="https://schema.org/FAQPage">
        <summary className="article-faq-accordion__summary">
          <HelpCircle className="w-5 h-5" />
          Resumen Exprés - {faqs.length} pregunta(s)
        </summary>
        <div className="article-faq-accordion__content">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="article-faq-accordion__item"
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <h3 className="article-faq-accordion__question" itemProp="name">
                {faq.question}
              </h3>
              <div
                className="article-faq-accordion__answer"
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
              >
                <div
                  itemProp="text"
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
              </div>
            </div>
          ))}
        </div>
      </details>

      {/* Floating pill button */}
      <button
        onClick={() => setIsOpen(true)}
        className="article-faq-pill"
        aria-label="Abrir resumen exprés"
      >
        <HelpCircle className="w-5 h-5" />
        <span>Resumen Exprés</span>
      </button>

      {/* Modal popup */}
      {isOpen && (
        <div className="article-faq-modal">
          <div className="article-faq-modal__backdrop" onClick={() => setIsOpen(false)} />
          <div className="article-faq-modal__content">
            <div className="article-faq-modal__header">
              <div className="article-faq-modal__title">
                <HelpCircle className="w-6 h-6" />
                <h2>Resumen Exprés</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="article-faq-modal__close"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="article-faq-modal__body">
              <p className="article-faq-modal__subtitle">
                Respuestas rápidas sobre: <strong>{articleTitle}</strong>
              </p>

              {faqs.map((faq, index) => (
                <div key={index} className="article-faq-modal__item">
                  <h3 className="article-faq-modal__question">
                    {faq.question}
                  </h3>
                  <div
                    className="article-faq-modal__answer"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
