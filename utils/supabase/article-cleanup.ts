import { ArticleBody } from '@/types';
import { createClient } from './client';
import { cleanupArticleImages } from './upload';

/**
 * Service for managing article lifecycle and associated cleanup operations
 */

/**
 * Extracts image URLs from article content
 */
const extractImageUrls = (articleBody: ArticleBody): string[] => {
  if (!articleBody?.content) {
    return [];
  }

  const imageUrls: string[] = [];

  const traverseContent = (content: ArticleBody['content']): void => {
    content.forEach((node) => {
      if (node.type === 'image' && node.attrs?.src) {
        imageUrls.push(node.attrs.src);
      }
      if (node.content) {
        traverseContent(node.content);
      }
    });
  };

  traverseContent(articleBody.content);
  return imageUrls;
};

/**
 * Syncs image usage for an article based on its current content
 */
const syncArticleImageUsage = async (
  articleId: number,
  articleBody: ArticleBody
) => {
  const supabase = await createClient();

  try {
    // Extract current image URLs from article content
    const currentImageUrls = extractImageUrls(articleBody);

    // Get existing image usage records
    const { data: existingUsage } = await supabase
      .from('article_image_usage')
      .select(
        `
        id,
        image_id,
        article_images!inner (
          public_url
        )
      `
      )
      .eq('article_id', articleId);

    const existingUrls =
      existingUsage?.map((usage) => usage.article_images[0].public_url) ?? [];

    // Find images to add (new in content)
    const urlsToAdd = currentImageUrls.filter(
      (url) => !existingUrls.includes(url)
    );

    // Find images to remove (no longer in content)
    const urlsToRemove = existingUrls.filter(
      (url) => !currentImageUrls.includes(url)
    );

    // Add new image usages
    for (const url of urlsToAdd) {
      const { data: imageRecord } = await supabase
        .from('article_images')
        .select('id')
        .eq('public_url', url)
        .single();

      if (imageRecord) {
        // Add usage record
        await supabase.from('article_image_usage').insert({
          article_id: articleId,
          image_id: imageRecord.id,
        });

        // Increment reference count
        const { data: currentImage } = await supabase
          .from('article_images')
          .select('reference_count')
          .eq('id', imageRecord.id)
          .single();

        if (currentImage) {
          await supabase
            .from('article_images')
            .update({
              reference_count: currentImage.reference_count + 1,
              updated_at: new Date().toISOString(),
            })
            .eq('id', imageRecord.id);
        }
      }
    }

    // Remove old image usages
    for (const url of urlsToRemove) {
      const usageToRemove = existingUsage?.find(
        (usage) => usage.article_images[0].public_url === url
      );

      if (usageToRemove) {
        // Remove usage record
        await supabase
          .from('article_image_usage')
          .delete()
          .eq('id', usageToRemove.id);

        // Decrement reference count
        const { data: imageRecord } = await supabase
          .from('article_images')
          .select('reference_count')
          .eq('id', usageToRemove.image_id)
          .single();

        if (imageRecord) {
          const newCount = Math.max(0, imageRecord.reference_count - 1);

          if (newCount === 0) {
            // Delete image from storage and database
            const { data: imageToDelete } = await supabase
              .from('article_images')
              .select('file_path')
              .eq('id', usageToRemove.image_id)
              .single();

            if (imageToDelete) {
              await supabase.storage
                .from('article-images')
                .remove([imageToDelete.file_path]);
            }

            await supabase
              .from('article_images')
              .delete()
              .eq('id', usageToRemove.image_id);
          } else {
            await supabase
              .from('article_images')
              .update({
                reference_count: newCount,
                updated_at: new Date().toISOString(),
              })
              .eq('id', usageToRemove.image_id);
          }
        }
      }
    }

    console.log(`Synced images for article ${articleId}:`, {
      added: urlsToAdd.length,
      removed: urlsToRemove.length,
    });
  } catch (error) {
    console.error('Error syncing article image usage:', error);
    throw error;
  }
};

/**
 * Deletes an article and cleans up all associated images
 */
const deleteArticleWithCleanup = async (articleId: number) => {
  const supabase = await createClient();

  try {
    // First clean up images
    await cleanupArticleImages(articleId);

    // Then delete the article
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', articleId);

    if (error) {
      throw error;
    }

    console.log(`Article ${articleId} deleted with image cleanup`);
  } catch (error) {
    console.error('Error deleting article with cleanup:', error);
    throw error;
  }
};

/**
 * Hook to run before updating an article to sync image usage
 */
const beforeArticleUpdate = async (
  articleId: number,
  newContent: ArticleBody
) => {
  try {
    await syncArticleImageUsage(articleId, newContent);
  } catch (error) {
    console.error('Error in beforeArticleUpdate hook:', error);
    // Don't throw to prevent blocking the update
  }
};

export {
  extractImageUrls,
  syncArticleImageUsage,
  deleteArticleWithCleanup,
  beforeArticleUpdate,
};
