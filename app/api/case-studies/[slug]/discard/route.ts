import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Reset the working draft to the canonical (published) content and clear the
 * dirty flag. The inverse of the publish promotion: canonical -> working.
 */
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

  const { data: existing, error: fetchError } = await supabase
    .from('case_studies')
    .select(
      [
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
    .single<{
      articleBody: unknown;
      headline: string | null;
      description: string | null;
      image: string | null;
      keywords: string | null;
      articleSection: string | null;
    }>();

  if (fetchError?.code === 'PGRST116') {
    return new NextResponse(
      JSON.stringify({ error: 'Case study not found or unauthorized' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (fetchError || !existing) {
    return new NextResponse(
      JSON.stringify({ error: fetchError?.message || 'Database error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { data, error } = await supabase
    .from('case_studies')
    .update({
      workingbody: existing.articleBody,
      workingheadline: existing.headline,
      workingdescription: existing.description,
      workingimage: existing.image,
      workingkeywords: existing.keywords,
      workingarticlesection: existing.articleSection,
      working_modified_at: new Date().toISOString(),
      is_dirty: false,
    })
    .eq('slug', slug)
    .eq('author', user.id)
    .select();

  if (error) {
    console.error('Case study discard error:', JSON.stringify(error, null, 2));
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Discard only touches working columns; nothing public changes, so no
  // cache revalidation is needed.
  return new NextResponse(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
