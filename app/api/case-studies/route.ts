import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createCaseStudySchema } from '@/utils/schemas/case-study.schema';

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
  const validation = createCaseStudySchema.safeParse(body);

  if (!validation.success) {
    return new NextResponse(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await supabase
    .from('case_studies')
    .insert([
      {
        ...validation.data,
        author: user.id,
        editor: user.id,
        // Also initialize working draft with the same content
        workingbody: validation.data.articleBody,
        workingheadline: validation.data.headline,
        workingdescription: validation.data.description,
        workingimage: validation.data.image,
        workingkeywords: validation.data.keywords,
        workingarticlesection: validation.data.articleSection,
        working_modified_at: new Date().toISOString(),
        is_dirty: false,
      },
    ])
    .select();

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new NextResponse(JSON.stringify(data), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
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
    .from('case_studies')
    .select('*')
    .eq('author', user.id);

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
