import { createClient } from '@/utils/supabase/server';
import { cleanupOrphanedImages } from '@/utils/supabase/upload';
import { NextRequest } from 'next/server';

/**
 * POST /api/cleanup-images
 * Cleans up orphaned images (images with 0 references)
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  try {
    // Check if user has permission (you may want to add admin checks here)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run cleanup
    await cleanupOrphanedImages();

    return Response.json({
      success: true,
      message: 'Orphaned images cleaned up successfully',
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return Response.json(
      { error: 'Failed to cleanup images' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cleanup-images
 * Returns statistics about orphaned images
 */
export async function GET() {
  const supabase = await createClient();

  try {
    // Get orphaned images count
    const { count: orphanedCount } = await supabase
      .from('article_images')
      .select('*', { count: 'exact', head: true })
      .eq('reference_count', 0);

    // Get total images count
    const { count: totalCount } = await supabase
      .from('article_images')
      .select('*', { count: 'exact', head: true });

    // Get total storage usage
    const { data: images } = await supabase
      .from('article_images')
      .select('file_size');

    const totalSize =
      images?.reduce((sum, img) => sum + (img.file_size || 0), 0) ?? 0;

    return Response.json({
      orphanedImages: orphanedCount ?? 0,
      totalImages: totalCount ?? 0,
      totalSizeBytes: totalSize,
      totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return Response.json(
      { error: 'Failed to get image statistics' },
      { status: 500 }
    );
  }
}
