import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createArticleSchema } from '@/utils/schemas/article.schema';
import {
  createMutationResponse,
  createCachedResponse,
  CacheHeaders,
  revalidateEditorPaths,
} from '@/utils/editor/cache';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const validation = createArticleSchema.safeParse(body);

  if (!validation.success) {
    return new NextResponse(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await supabase
    .from('articles')
    .insert([{ ...validation.data, author: user.id, editor: user.id }])
    .select();

  if (error && (error.message || error.code || Object.keys(error).length > 0)) {
    console.error('Article insert error:', JSON.stringify(error, null, 2));
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Database error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (!data) {
    return new NextResponse(JSON.stringify({ error: 'No data returned' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Revalidate paths after creation
  revalidateEditorPaths('articles');

  return createMutationResponse(data, 201);
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('author', user.id);

  if (error && (error.message || error.code || Object.keys(error).length > 0)) {
    console.error('Articles fetch error:', JSON.stringify(error, null, 2));
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Database error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (!data) {
    return new NextResponse(JSON.stringify({ error: 'No data returned' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return createCachedResponse(data, 200, CacheHeaders.LIST);
}
