import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

export default async function CaseStudiesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('case_studies')
    .select('id, slug, headline, status, modified_at')
    .order('modified_at', { ascending: false });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Case Studies</h2>
        <Link href="/dashboard/case-studies/new">New Case Study</Link>
      </div>
      <ul>
        {(data ?? []).map((c) => (
          <li key={c.id}>
            <Link href={`/dashboard/case-studies/${c.slug}`}>
              {c.headline ?? c.slug}
            </Link>{' '}
            - <small>{c.status}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
