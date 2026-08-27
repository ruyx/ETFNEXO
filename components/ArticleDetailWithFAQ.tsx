'use client';

import { useState, useRef } from 'react';
import ArticleFAQ from '@/components/ArticleFAQ';
import InfiniteArticleScroll from '@/components/InfiniteArticleScroll';

interface Article {
  id: string;
  slug: string;
  title: string;
  faq?: any[];
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
        />
      )}
    </>
  );
}
