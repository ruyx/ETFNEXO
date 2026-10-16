'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { NewsArticle } from './NewsCard';

/**
 * HeroNewsSlideshow - Hero de la home con las últimas noticias.
 * Misma composición que HeroSplit (contenido a la izquierda, foto fundida a
 * la derecha) pero rotando entre las noticias más recientes. Avanza sola cada
 * 7 s, se pausa al pasar el ratón o enfocar, y no avanza con
 * prefers-reduced-motion.
 */
interface HeroNewsSlideshowProps {
  articles: NewsArticle[];
  intervalMs?: number;
}

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/8353820/pexels-photo-8353820.jpeg?auto=compress&cs=tinysrgb&w=1920';

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr));
}

function getExcerpt(article: NewsArticle, maxLength = 170): string {
  const raw = article.excerpt || article.content || '';
  const text = raw
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return text.length <= maxLength ? text : `${text.substring(0, maxLength).trim()}…`;
}

function articleUrl(article: NewsArticle): string {
  return article.source_type === 'interview' ? `/entrevistas/${article.slug}` : `/noticias/${article.slug}`;
}

export default function HeroNewsSlideshow({ articles, intervalMs = 7000 }: HeroNewsSlideshowProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  // Solo se montan las imágenes del slide activo y del siguiente: evita
  // descargar las cinco fotos a la vez y competir con el LCP.
  const [loaded, setLoaded] = useState<number[]>([0, 1]);
  const total = articles.length;

  const goTo = useCallback((i: number) => setIndex(((i % total) + total) % total), [total]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (total < 2) return;
    setLoaded((prev) => {
      const next = (index + 1) % total;
      return prev.includes(index) && prev.includes(next) ? prev : Array.from(new Set([...prev, index, next]));
    });
  }, [index, total]);

  useEffect(() => {
    if (total < 2 || paused || reducedMotion) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % total), intervalMs);
    return () => clearInterval(timer);
  }, [total, paused, reducedMotion, intervalMs]);

  if (total === 0) return null;

  const current = articles[index];

  return (
    <section
      className="hero-split hero-slideshow"
      aria-roledescription="carrusel"
      aria-label="Últimas noticias"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* h1 de la página (SEO); el titular visible de cada noticia es un h2 */}
      <h1 className="sr-only">Rankings de ETFs 2026, Noticias y Análisis para Inversores</h1>

      <div className="hero-split__media" aria-hidden="true">
        {articles.map((article, i) => (
          <div key={article.id} className={`hero-slideshow__slide${i === index ? ' is-active' : ''}`}>
            {loaded.includes(i) && (
            <Image
              src={article.featured_image_url || FALLBACK_IMAGE}
              alt=""
              fill
              priority={i === 0}
              loading={i === 0 ? 'eager' : 'lazy'}
              sizes="(max-width: 1023px) 100vw, 60vw"
              quality={80}
              className="hero-split__image"
            />
            )}
          </div>
        ))}
        <div className="hero-split__fade" />
      </div>

      <div className="container hero-split__container">
        <div className="hero-split__content hero-slideshow__content" key={current.id} aria-live="polite">
          <span className="hero-split__eyebrow animate-fade-in-up">
            <span className="hero-split__eyebrow-dot" />
            Última hora · {current.source_name} · {formatDate(current.published_at)}
          </span>

          <h2 className="hero-split__title hero-slideshow__title animate-fade-in-up [animation-delay:100ms]">
            <Link href={articleUrl(current)}>{current.title}</Link>
          </h2>

          <p className="hero-split__description animate-fade-in-up [animation-delay:200ms]">{getExcerpt(current)}</p>

          <div className="hero-split__actions animate-fade-in-up [animation-delay:300ms]">
            <Link href={articleUrl(current)} className="btn-primary">
              Leer la noticia
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/noticias" className="btn-secondary btn-secondary--on-dark">
              Ver todas las noticias
            </Link>
          </div>
        </div>

        {total > 1 && (
          <div className="hero-slideshow__controls">
            <button type="button" className="hero-slideshow__arrow" onClick={() => goTo(index - 1)} aria-label="Noticia anterior">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="hero-slideshow__dots" role="tablist" aria-label="Seleccionar noticia">
              {articles.map((article, i) => (
                <button
                  key={article.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Noticia ${i + 1} de ${total}`}
                  className={`hero-slideshow__dot${i === index ? ' is-active' : ''}`}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
            <button type="button" className="hero-slideshow__arrow" onClick={() => goTo(index + 1)} aria-label="Noticia siguiente">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <span className="hero-slideshow__counter" aria-hidden="true">
              {index + 1} / {total}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
