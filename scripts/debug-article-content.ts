import { createAdminClient } from '../lib/supabase/admin';

async function checkArticleContent() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('news_articles')
    .select('slug, content')
    .not('content', 'is', null)
    .neq('content', '')
    .limit(1)
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== SLUG ===');
  console.log(data.slug);
  console.log('\n=== CONTENT (first 1000 chars) ===');
  console.log(data.content.substring(0, 1000));
  console.log('\n=== NEWLINE CHECK ===');
  console.log('Contains \\n\\n:', data.content.includes('\n\n'));
  console.log('Contains \\n:', data.content.includes('\n'));
  console.log('Contains <p>:', data.content.includes('<p>'));
  console.log('Contains <br>:', data.content.includes('<br>'));
  console.log('\n=== RAW REPRESENTATION ===');
  console.log(JSON.stringify(data.content.substring(0, 500)));
}

checkArticleContent();
