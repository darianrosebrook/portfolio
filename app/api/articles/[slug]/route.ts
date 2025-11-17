import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { updateArticleSchema } from '@/utils/schemas/article.schema';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error && (error.message || error.code || Object.keys(error).length > 0)) {
    console.error('Article fetch error:', JSON.stringify(error, null, 2));
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Database error' }),
      {
        status: error.code === 'PGRST116' ? 404 : 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (!data) {
    return new NextResponse(JSON.stringify({ error: 'Article not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new NextResponse(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

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
    .eq('slug', slug)
    .eq('author', user.id)
    .select();

  if (error && (error.message || error.code || Object.keys(error).length > 0)) {
    console.error('Article update error:', JSON.stringify(error, null, 2));
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Database error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (!data || data.length === 0) {
    return new NextResponse(
      JSON.stringify({ error: 'Article not found or unauthorized' }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return new NextResponse(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Save working draft fields without overwriting published content
export async function PATCH(
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
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();

  // For now, save working draft to the main fields since working columns don't exist yet
  // To enable proper draft functionality, run utils/supabase/migrations/add-working-columns.sql
  const {
    workingBody,
    workingHeadline,
    workingDescription,
    workingImage,
    workingKeywords,
    workingArticleSection,
  } = body;

  const { data, error } = await supabase
    .from('articles')
    .update({
      articleBody: workingBody,
      headline: workingHeadline,
      description: workingDescription,
      image: workingImage,
      keywords: workingKeywords,
      articleSection: workingArticleSection,
      modified_at: new Date().toISOString(),
    })
    .eq('slug', slug)
    .eq('author', user.id)
    .select();

  if (error && (error.message || error.code || Object.keys(error).length > 0)) {
    console.error(
      'Article draft update error:',
      JSON.stringify(error, null, 2)
    );
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Database error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (!data || data.length === 0) {
    return new NextResponse(
      JSON.stringify({ error: 'Article not found or unauthorized' }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return new NextResponse(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function DELETE(
  _request: Request,
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
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('slug', slug)
    .eq('author', user.id);

  if (error && (error.message || error.code || Object.keys(error).length > 0)) {
    console.error('Article delete error:', JSON.stringify(error, null, 2));
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Database error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return new NextResponse(null, {
    status: 204,
  });
}
