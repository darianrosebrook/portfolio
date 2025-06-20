import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { updateArticleSchema } from '@/utils/schemas/article.schema';

export async function GET(request: Request, context) {
  const { params } = context;
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new NextResponse(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function PUT(request: Request, context) {
  const { params } = context;
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const validation = updateArticleSchema.safeParse(body);

  if (!validation.success) {
    return new NextResponse(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await supabase
    .from('articles')
    .update(validation.data)
    .eq('slug', params.slug)
    .eq('author', session.user.id)
    .select();

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new NextResponse(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function DELETE(request: Request, context) {
  const { params } = context;
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('slug', params.slug)
    .eq('author', session.user.id);

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new NextResponse(null, {
    status: 204,
  });
}
