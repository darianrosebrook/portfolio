import Button from '@/ui/components/Button';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

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
        <Button as="a" href="/dashboard/articles/new">
          New Article
        </Button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {(data ?? []).map((a) => {
          const { headline, slug, status } = a;

          return (
            <div key={a.id}>
              <Link href={`/dashboard/articles/${a.slug}`}>
                {headline ?? slug}
              </Link>{' '}
              - <small>{status}</small>
            </div>
          );
        })}
      </div>
    </div>
  );
}
