import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * HeroSplit - Hero con contenido a la izquierda y fotografía a la derecha
 * fundida con el fondo azul marino (fade horizontal en escritorio, vertical
 * en móvil). Sistema de diseño Agora.
 */
interface HeroCta {
  href: string;
  label: string;
}

interface HeroSplitProps {
  title: ReactNode;
  description: string;
  image: { src: string; alt: string };
  eyebrow?: string;
  primaryCta?: HeroCta;
  secondaryCta?: HeroCta;
  /** Alineación vertical del contenido en escritorio */
  align?: 'center' | 'start';
}

export default function HeroSplit({
  title,
  description,
  image,
  eyebrow,
  primaryCta,
  secondaryCta,
  align = 'center',
}: HeroSplitProps) {
  return (
    <section className={`hero-split hero-split--${align}`}>
      {/* Fotografía: ocupa la mitad derecha en escritorio, todo el fondo en móvil */}
      <div className="hero-split__media" aria-hidden="true">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 60vw"
          quality={85}
          className="hero-split__image"
        />
        <div className="hero-split__fade" />
      </div>

      <div className="container hero-split__container">
        <div className="hero-split__content">
          {eyebrow && (
            <span className="hero-split__eyebrow animate-fade-in-up">
              <span className="hero-split__eyebrow-dot" />
              {eyebrow}
            </span>
          )}

          <h1 className="hero-split__title animate-fade-in-up [animation-delay:100ms]">{title}</h1>

          <p className="hero-split__description animate-fade-in-up [animation-delay:200ms]">{description}</p>

          {(primaryCta || secondaryCta) && (
            <div className="hero-split__actions animate-fade-in-up [animation-delay:300ms]">
              {primaryCta && (
                <Link href={primaryCta.href} className="btn-primary">
                  {primaryCta.label}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
              {secondaryCta && (
                <Link href={secondaryCta.href} className="btn-secondary btn-secondary--on-dark">
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
