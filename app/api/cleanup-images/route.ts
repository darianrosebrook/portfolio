import { isAdminUserId } from '@/utils/env';
import { createClient } from '@/utils/supabase/server';
import { cleanupOrphanedImages } from '@/utils/supabase/upload';

/**
 * POST /api/cleanup-images
 * Cleans up orphaned images (images with 0 references).
 * Requires an authenticated admin (ADMIN_USER_IDS).
 */
export async function POST() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (!isAdminUserId(user.id)) {
      return Response.json(
        { error: 'Forbidden' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    await cleanupOrphanedImages();

    return Response.json(
      {
        success: true,
        message: 'Orphaned images cleaned up successfully',
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Cleanup error:', error);
    return Response.json(
      { error: 'Failed to cleanup images' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

/**
 * GET /api/cleanup-images
 * Returns statistics about orphaned images (admin only).
 */
export async function GET() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (!isAdminUserId(user.id)) {
      return Response.json(
        { error: 'Forbidden' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const { count: orphanedCount } = await supabase
      .from('article_images')
      .select('*', { count: 'exact', head: true })
      .eq('reference_count', 0);

    const { count: totalCount } = await supabase
      .from('article_images')
      .select('*', { count: 'exact', head: true });

    const { data: images } = await supabase
      .from('article_images')
      .select('file_size');

    const totalSize =
      images?.reduce((sum, img) => sum + (img.file_size || 0), 0) ?? 0;

    return Response.json(
      {
        orphanedImages: orphanedCount ?? 0,
        totalImages: totalCount ?? 0,
        totalSizeBytes: totalSize,
        totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Stats error:', error);
    return Response.json(
      { error: 'Failed to get image statistics' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
