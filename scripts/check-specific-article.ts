import { createAdminClient } from '../lib/supabase/admin';
import { checkImageUrl } from '../lib/pexels-client';

async function checkArticle() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('news_articles')
    .select('slug, title, featured_image_url')
    .eq('slug', 'invertir-en-etfs-de-revolut-si-o-no')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Slug:', data.slug);
  console.log('Title:', data.title);
  console.log('Image URL:', data.featured_image_url);

  if (data.featured_image_url) {
    console.log('\nChecking if image works...');
    const works = await checkImageUrl(data.featured_image_url);
    console.log('Image works:', works ? '✅ YES' : '❌ NO (404)');
  } else {
    console.log('❌ No image URL');
  }
}

checkArticle();
