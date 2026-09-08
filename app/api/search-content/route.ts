import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  searchContent,
  type ContentType,
} from '@/utils/supabase/contentRelations';

/**
 * Cross-content search for the editor's inline linking and the
 * RelatedContentPicker. Authenticated dashboard feature: returns published
 * content plus the caller's own drafts.
 */
export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';

  if (q.trim().length < 2) {
    return NextResponse.json({ data: [], error: null });
  }

  const excludeIdRaw = searchParams.get('excludeId');
  const excludeId = excludeIdRaw ? Number(excludeIdRaw) : undefined;
  const excludeTypeRaw = searchParams.get('excludeType');
  const excludeType =
    excludeTypeRaw === 'article' || excludeTypeRaw === 'case-study'
      ? (excludeTypeRaw as ContentType)
      : undefined;
  const limitRaw = Number(searchParams.get('limit') ?? '8');
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(limitRaw, 1), 20)
    : 8;

  try {
    const data = await searchContent(supabase, q, {
      excludeId: Number.isFinite(excludeId) ? excludeId : undefined,
      excludeType,
      limit,
      userId: user.id,
    });
    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error('Content search failed:', error);
    return new NextResponse(
      JSON.stringify({ data: [], error: 'Failed to search content' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
