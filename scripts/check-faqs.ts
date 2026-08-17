import { createAdminClient } from '@/lib/supabase/admin';

async function checkFAQs() {
  console.log('Verificando artículos con FAQs...\n');

  const supabase = createAdminClient();

  const { data: articles, error } = await supabase
    .from('news_articles')
    .select('id, title, slug, faq')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Total de artículos recientes: ${articles?.length || 0}\n`);

  articles?.forEach((article: any, index: number) => {
    const hasFaq = article.faq && Array.isArray(article.faq) && article.faq.length > 0;
    console.log(`${index + 1}. ${article.title}`);
    console.log(`   Slug: ${article.slug}`);
    console.log(`   FAQs: ${hasFaq ? `✅ ${article.faq.length} pregunta(s)` : '❌ Sin FAQs'}`);
    if (hasFaq) {
      article.faq.forEach((faq: any, i: number) => {
        console.log(`      ${i + 1}. ${faq.question}`);
      });
    }
    console.log('');
  });
}

checkFAQs();
