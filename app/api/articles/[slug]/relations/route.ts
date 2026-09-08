import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  getRelations,
  getBacklinks,
  syncRelations,
} from '@/utils/supabase/contentRelations';
import { syncRelationsSchema } from '@/utils/schemas/contentRelations.schema';
import { revalidatePublicArticlePaths } from '@/utils/supabase/revalidateContent';

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

/**
 * GET: outgoing relations + incoming backlinks for an article.
 * Public read (RLS allows anonymous SELECT); the article itself must be
 * visible to the caller (published, or the caller's own draft).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase.from('articles').select('id').eq('slug', slug);
  if (user) {
    query = query.or(`status.eq.published,author.eq.${user.id}`);
  } else {
    query = query.eq('status', 'published');
  }

  const { data: article, error } = await query.maybeSingle();

  if (error) {
    console.error(
      'Article relations fetch error:',
      JSON.stringify(error, null, 2)
    );
    return new NextResponse(JSON.stringify({ error: 'Database error' }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  if (!article) {
    return new NextResponse(JSON.stringify({ error: 'Article not found' }), {
      status: 404,
      headers: JSON_HEADERS,
    });
  }

  const [relations, backlinks] = await Promise.all([
    getRelations(supabase, article.id, 'article'),
    getBacklinks(supabase, article.id, 'article'),
  ]);

  return new NextResponse(JSON.stringify({ relations, backlinks }), {
    status: 200,
    headers: { ...JSON_HEADERS, 'Cache-Control': 'private, no-store' },
  });
}

/**
 * PUT: replace the full relation set an article declares. Author only.
 * Relations render on the public page, so the cache is revalidated.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: JSON_HEADERS,
    });
  }

  const body = await request.json().catch(() => null);
  const validation = syncRelationsSchema.safeParse(body);

  if (!validation.success) {
    return new NextResponse(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const { data: article, error: lookupError } = await supabase
    .from('articles')
    .select('id')
    .eq('slug', slug)
    .eq('author', user.id)
    .maybeSingle();

  if (lookupError) {
    console.error(
      'Article relations lookup error:',
      JSON.stringify(lookupError, null, 2)
    );
    return new NextResponse(JSON.stringify({ error: 'Database error' }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  if (!article) {
    return new NextResponse(
      JSON.stringify({ error: 'Article not found or unauthorized' }),
      { status: 404, headers: JSON_HEADERS }
    );
  }

  const result = await syncRelations(
    supabase,
    article.id,
    'article',
    validation.data.items
  );

  if (result.error) {
    return new NextResponse(JSON.stringify({ error: result.error }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  revalidatePublicArticlePaths();

  const relations = await getRelations(supabase, article.id, 'article');
  return new NextResponse(
    JSON.stringify({ synced: result.synced, relations }),
    {
      status: 200,
      headers: JSON_HEADERS,
    }
  );
}
