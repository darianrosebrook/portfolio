import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

export default async function ArticlesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('articles')
    .select('id, slug, headline, status, modified_at')
    .order('modified_at', { ascending: false });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Articles</h2>
        <Link href="/dashboard/articles/new">New Article</Link>
      </div>
      <ul>
        {(data ?? []).map((a) => (
          <li key={a.id}>
            <Link href={`/dashboard/articles/${a.slug}`}>
              {a.headline ?? a.slug}
            </Link>{' '}
            - <small>{a.status}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}




