import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  updateArticleSchema,
  patchArticleDraftSchema,
} from '@/utils/schemas/article.schema';

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

  const nowIso = new Date().toISOString();
  let updateData: (typeof validation.data & {
    modified_at: string;
    published_at?: string | null;
    working_modified_at?: string;
    is_dirty?: boolean;
  }) = {
    ...validation.data,
    modified_at: nowIso,
  };

  if (updateData.status === 'published') {
    const { data: existing, error: existingError } = await supabase
      .from('articles')
      .select(
        [
          'workingbody',
          'workingheadline',
          'workingdescription',
          'workingimage',
          'workingkeywords',
          'workingarticlesection',
          'articleBody',
          'headline',
          'description',
          'image',
          'keywords',
          'articleSection',
        ].join(',')
      )
      .eq('slug', slug)
      .eq('author', user.id)
      .single();

    if (
      existingError &&
      (existingError.message ||
        existingError.code ||
        Object.keys(existingError).length > 0)
    ) {
      console.error(
        'Article publish fetch error:',
        JSON.stringify(existingError, null, 2)
      );
      return new NextResponse(
        JSON.stringify({
          error: existingError.message || 'Database error',
        }),
        {
          status: existingError.code === 'PGRST116' ? 404 : 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!existing) {
      return new NextResponse(
        JSON.stringify({ error: 'Article not found or unauthorized' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    updateData = {
      ...updateData,
      articleBody:
        (existing.workingbody ?? existing.articleBody) ?? null,
      headline: existing.workingheadline ?? existing.headline,
      description: existing.workingdescription ?? existing.description,
      image: existing.workingimage ?? existing.image,
      keywords: existing.workingkeywords ?? existing.keywords,
      articleSection:
        existing.workingarticlesection ?? existing.articleSection,
      published_at: updateData.published_at ?? nowIso,
      working_modified_at: nowIso,
      is_dirty: false,
    };
  }

  const { data, error } = await supabase
    .from('articles')
    .update(updateData)
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
  const validation = patchArticleDraftSchema.safeParse(body);

  if (!validation.success) {
    return new NextResponse(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await supabase
    .from('articles')
    .update({
      ...validation.data,
      working_modified_at: new Date().toISOString(),
      is_dirty: true,
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
