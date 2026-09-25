'use client';

import { useState, useRef } from 'react';
import ArticleFAQ from '@/components/ArticleFAQ';
import InfiniteArticleScroll from '@/components/InfiniteArticleScroll';

interface Article {
  id: string;
  slug: string;
  title: string;
  faq?: any[];
  sponsor_enabled?: boolean;
  sponsor_company_name?: string | null;
  sponsor_logo_url?: string | null;
  sponsor_website_url?: string | null;
  [key: string]: any;
}

interface ArticleDetailWithFAQProps {
  initialArticle: Article;
  basePath: 'noticias' | 'academia';
  children: React.ReactNode;
}

export default function ArticleDetailWithFAQ({ initialArticle, basePath, children }: ArticleDetailWithFAQProps) {
  const [currentArticle, setCurrentArticle] = useState<Article>(initialArticle);
  const initialArticleRef = useRef<HTMLDivElement | null>(null);

  const handleArticleChange = (article: Article) => {
    setCurrentArticle(article);
  };

  return (
    <>
      {/* Renderizar el artículo inicial con una referencia */}
      <div ref={initialArticleRef}>
        {children}
      </div>

      {/* Infinite scroll de artículos siguientes */}
      <InfiniteArticleScroll
        initialArticle={initialArticle}
        initialArticleElement={initialArticleRef}
        basePath={basePath}
        onArticleChange={handleArticleChange}
      />

      {/* FAQ flotante que cambia según el artículo visible */}
      {currentArticle.faq && currentArticle.faq.length > 0 && (
        <ArticleFAQ
          key={`${currentArticle.id}-${currentArticle.title}`}
          faqs={currentArticle.faq}
          articleTitle={currentArticle.title}
          sponsorData={{
            sponsor_enabled: currentArticle.sponsor_enabled,
            sponsor_company_name: currentArticle.sponsor_company_name,
            sponsor_logo_url: currentArticle.sponsor_logo_url,
            sponsor_website_url: currentArticle.sponsor_website_url
          }}
        />
      )}
    </>
  );
}
