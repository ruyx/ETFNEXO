import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkAuthors() {
  console.log('Checking articles with author data...\n');

  // Check a few articles from the view
  const { data: articles, error } = await supabase
    .from('news_articles_with_metadata')
    .select('id, title, author_id, agent_name, agent_slug, agent_avatar')
    .limit(5);

  if (error) {
    console.error('Error fetching articles:', error);
    return;
  }

  console.log('Articles from view:');
  articles.forEach(article => {
    console.log({
      id: article.id.substring(0, 8),
      title: article.title?.substring(0, 50),
      author_id: article.author_id ? article.author_id.substring(0, 8) : null,
      agent_name: article.agent_name,
      agent_slug: article.agent_slug,
      agent_avatar: article.agent_avatar
    });
  });

  // Check agents table
  console.log('\nChecking AI agents:');
  const { data: agents, error: agentsError } = await supabase
    .from('ai_agents')
    .select('id, display_name, slug')
    .limit(5);

  if (agentsError) {
    console.error('Error fetching agents:', agentsError);
    return;
  }

  agents.forEach(agent => {
    console.log({
      id: agent.id.substring(0, 8),
      display_name: agent.display_name,
      slug: agent.slug
    });
  });
}

checkAuthors()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
