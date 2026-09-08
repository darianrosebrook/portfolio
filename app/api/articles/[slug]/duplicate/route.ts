import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { slugify } from '@/utils/slugify';

export async function POST(
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

  // Fetch the original article
  const { data: original, error: fetchError } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('author', user.id)
    .single();

  if (fetchError || !original) {
    return new NextResponse(
      JSON.stringify({ error: 'Article not found or unauthorized' }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Generate a unique slug for the duplicate
  const baseSlug = slugify(`${original.headline || slug}-copy`);
  let newSlug = baseSlug;
  let counter = 1;

  // Check for existing slugs and increment if necessary
  while (true) {
    const { data: existing } = await supabase
      .from('articles')
      .select('slug')
      .eq('slug', newSlug)
      .single();

    if (!existing) break;
    newSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Create the duplicate. Copy the EFFECTIVE content: a dirty source has a
  // pending revision the author expects to carry over; a clean source has
  // canonical = working, so this is the same as copying canonical.
  const effective = {
    articleBody: original.is_dirty
      ? (original.workingbody ?? original.articleBody)
      : original.articleBody,
    headline: original.is_dirty
      ? (original.workingheadline ?? original.headline)
      : original.headline,
    description: original.is_dirty
      ? (original.workingdescription ?? original.description)
      : original.description,
    image: original.is_dirty
      ? (original.workingimage ?? original.image)
      : original.image,
    keywords: original.is_dirty
      ? (original.workingkeywords ?? original.keywords)
      : original.keywords,
    articleSection: original.is_dirty
      ? (original.workingarticlesection ?? original.articleSection)
      : original.articleSection,
  };

  const { data: duplicate, error: insertError } = await supabase
    .from('articles')
    .insert({
      slug: newSlug,
      headline: effective.headline ? `${effective.headline} (Copy)` : null,
      description: effective.description,
      articleBody: effective.articleBody,
      articleSection: effective.articleSection,
      keywords: effective.keywords,
      image: effective.image,
      status: 'draft', // Always create as draft
      author: user.id,
      editor: user.id,
      wordCount: original.wordCount,
      // Seed the working mirror like POST /api/articles does, so the new
      // draft opens clean rather than null.
      workingbody: effective.articleBody,
      workingheadline: effective.headline
        ? `${effective.headline} (Copy)`
        : null,
      workingdescription: effective.description,
      workingimage: effective.image,
      workingkeywords: effective.keywords,
      workingarticlesection: effective.articleSection,
      working_modified_at: new Date().toISOString(),
      is_dirty: false,
    })
    .select()
    .single();

  if (insertError) {
    console.error(
      'Article duplicate error:',
      JSON.stringify(insertError, null, 2)
    );
    return new NextResponse(
      JSON.stringify({
        error: insertError.message || 'Failed to duplicate article',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return new NextResponse(JSON.stringify(duplicate), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}
