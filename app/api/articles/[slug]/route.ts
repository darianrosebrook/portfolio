import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { updateArticleSchema } from '@/utils/schemas/article.schema';
import {
  createCachedResponse,
  createMutationResponse,
  CacheHeaders,
  revalidateEditorPaths,
} from '@/utils/editor/cache';

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

  return createCachedResponse(data, 200, CacheHeaders.EDITOR_GET);
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

  // If publishing (status === 'published'), copy working columns to published columns
  const updateData: Record<string, unknown> = { ...validation.data };

  if (validation.data.status === 'published') {
    // First, get current record to check for working columns
    const { data: currentRecord } = await supabase
      .from('articles')
      .select(
        'is_dirty, workingbody, workingheadline, workingdescription, workingimage, workingkeywords, workingarticlesection'
      )
      .eq('slug', slug)
      .eq('author', user.id)
      .single();

    if (currentRecord?.is_dirty) {
      // Copy working columns to published columns
      updateData.articleBody =
        currentRecord.workingbody ?? updateData.articleBody;
      updateData.headline =
        currentRecord.workingheadline ?? updateData.headline;
      updateData.description =
        currentRecord.workingdescription ?? updateData.description;
      updateData.image = currentRecord.workingimage ?? updateData.image;
      updateData.keywords =
        currentRecord.workingkeywords ?? updateData.keywords;
      updateData.articleSection =
        currentRecord.workingarticlesection ?? updateData.articleSection;

      // Clear working columns and dirty flag
      updateData.workingbody = null;
      updateData.workingheadline = null;
      updateData.workingdescription = null;
      updateData.workingimage = null;
      updateData.workingkeywords = null;
      updateData.workingarticlesection = null;
      updateData.working_modified_at = null;
      updateData.is_dirty = false;
    }
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

  // Revalidate paths after successful mutation
  revalidateEditorPaths('articles');

  return createMutationResponse(data);
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

  // Use working columns to preserve published content
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
      workingbody: workingBody,
      workingheadline: workingHeadline,
      workingdescription: workingDescription,
      workingimage: workingImage,
      workingkeywords: workingKeywords,
      workingarticlesection: workingArticleSection,
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

  // Revalidate paths after successful autosave
  revalidateEditorPaths('articles');

  return createMutationResponse(data);
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
    headers: { 'Cache-Control': CacheHeaders.MUTATION },
  });
}
