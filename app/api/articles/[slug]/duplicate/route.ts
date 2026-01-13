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

  // Create the duplicate
  const { data: duplicate, error: insertError } = await supabase
    .from('articles')
    .insert({
      slug: newSlug,
      headline: original.headline ? `${original.headline} (Copy)` : null,
      description: original.description,
      articleBody: original.articleBody,
      articleSection: original.articleSection,
      keywords: original.keywords,
      image: original.image,
      status: 'draft', // Always create as draft
      author: user.id,
      editor: user.id,
      wordCount: original.wordCount,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Article duplicate error:', JSON.stringify(insertError, null, 2));
    return new NextResponse(
      JSON.stringify({ error: insertError.message || 'Failed to duplicate article' }),
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
