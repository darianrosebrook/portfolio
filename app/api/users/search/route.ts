import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * User search API endpoint for mentions
 * Searches profiles by username or full name
 */
export async function GET(request: Request) {
  const supabase = await createClient();

  // Check authentication
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

  // Get search query from URL params
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (!query || query.length < 1) {
    return NextResponse.json({ users: [] });
  }

  // Search profiles by username or full_name
  // Limit to public profiles or profiles the user has access to
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
    .eq('privacy', 'public')
    .limit(10);

  if (error) {
    console.error('User search error:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Database error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Transform to mention format
  const users = (data || []).map((profile) => ({
    id: profile.id,
    label: profile.username || profile.full_name,
    avatar: profile.avatar_url || null,
  }));

  return NextResponse.json({ users });
}
