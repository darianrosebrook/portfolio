import { createClient } from './client';

type Media = {
  name: string;
  data:
    | string
    | ArrayBuffer
    | Blob
    | File
    | FormData
    | URLSearchParams
    | ReadableStream<Uint8Array>
    | null;
  // video
  duration?: number;
  // image
  width?: number;
  height?: number;
  // audio
  channels?: number;
  sampleRate?: number;
  bitDepth?: number;
  // pdf
  pageCount?: number;
};

type MediaType = 'image' | 'video' | 'audio' | 'pdf';

type MediaUpload = {
  type: MediaType;
  media: Media;
};

/**
 * Generates a SHA-256 hash from file content for deduplication
 */
const generateFileHash = async (file: File | Blob): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Gets image dimensions from a file
 */
const getImageDimensions = (
  file: File
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Uploads a file with deduplication and usage tracking.
 * @param {object} params - The upload parameters.
 * @param {MediaUpload} params.file - The file to upload.
 * @param {string} params.bucket - The Supabase storage bucket.
 * @param {number} [params.articleId] - The ID of the article to associate the image with.
 * @returns {Promise<string>} A promise that resolves to the public URL of the uploaded file.
 */
const upload = async ({
  file,
  bucket,
  articleId,
}: {
  file: MediaUpload;
  bucket: string;
  articleId?: number;
}) => {
  const supabase = await createClient();

  try {
    const { name, data: fileData } = file.media;

    if (!fileData || !(fileData instanceof File)) {
      throw new Error('Invalid file data');
    }

    // Generate content hash for deduplication
    const hash = await generateFileHash(fileData);

    // Check if image already exists by hash
    const { data: existingImage } = await supabase
      .from('article_images')
      .select('*')
      .eq('hash', hash)
      .single();

    let imageRecord;

    if (existingImage) {
      // Image already exists, increment reference count
      const { data: updatedImage, error: updateError } = await supabase
        .from('article_images')
        .update({
          reference_count: existingImage.reference_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingImage.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      imageRecord = updatedImage;
    } else {
      // New image, upload to storage and create record
      const fileExtension = name.split('.').pop() ?? '';
      const fileName = `${hash}.${fileExtension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, fileData, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }
      if (!uploadData) {
        throw new Error('Failed to upload file');
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(fileName);

      // Get image dimensions if it's an image
      const dimensions: { width: number; height: number } = {
        width: 0,
        height: 0,
      };
      if (
        file.type === 'image' &&
        fileData instanceof File &&
        fileData.type.startsWith('image/')
      ) {
        try {
          const { width, height } = await getImageDimensions(fileData);
          if (!isNaN(width) && width > 0) dimensions.width = width;
          if (!isNaN(height) && height > 0) dimensions.height = height;
        } catch {
          // Warn if dimensions cannot be determined
          console.warn('Failed to get image dimensions');
        }
      }

      // Create image record
      const { data: newImage, error: insertError } = await supabase
        .from('article_images')
        .insert({
          hash,
          original_name: name,
          file_path: fileName,
          public_url: publicUrl,
          file_size: fileData.size,
          mime_type: fileData.type,
          width: dimensions.width,
          height: dimensions.height,
          reference_count: 1,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      imageRecord = newImage;
    }

    // Track usage if articleId is provided
    if (articleId && imageRecord) {
      // Check if this usage already exists
      const { data: existingUsage } = await supabase
        .from('article_image_usage')
        .select('id')
        .eq('article_id', articleId)
        .eq('image_id', imageRecord.id)
        .single();

      if (!existingUsage) {
        await supabase.from('article_image_usage').insert({
          article_id: articleId,
          image_id: imageRecord.id,
        });
      }
    }

    return imageRecord?.public_url ?? '';
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

/**
 * Removes an image from an article and decrements its reference count.
 * @param {string} imageUrl - The public URL of the image to remove.
 * @param {number} articleId - The ID of the article to remove the image from.
 * @returns {Promise<void>}
 */
const removeImageFromArticle = async (imageUrl: string, articleId: number) => {
  const supabase = await createClient();

  try {
    // Find the image record by URL
    const { data: imageRecord } = await supabase
      .from('article_images')
      .select('*')
      .eq('public_url', imageUrl)
      .single();

    if (!imageRecord) {
      return;
    }

    // Remove usage record
    await supabase
      .from('article_image_usage')
      .delete()
      .eq('article_id', articleId)
      .eq('image_id', imageRecord.id);

    // Decrement reference count
    const newReferenceCount = Math.max(0, imageRecord.reference_count - 1);

    if (newReferenceCount === 0) {
      // No more references, delete image from storage and database
      await supabase.storage
        .from('article-images')
        .remove([imageRecord.file_path]);

      await supabase.from('article_images').delete().eq('id', imageRecord.id);
    } else {
      // Update reference count
      await supabase
        .from('article_images')
        .update({
          reference_count: newReferenceCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', imageRecord.id);
    }
  } catch (error) {
    console.error('Error removing image:', error);
    throw error;
  }
};

/**
 * Cleans up all images associated with a specific article.
 * @param {number} articleId - The ID of the article to clean up images for.
 * @returns {Promise<void>}
 */
const cleanupArticleImages = async (articleId: number) => {
  const supabase = await createClient();

  try {
    // Get all images used by this article
    const { data: usageRecords } = await supabase
      .from('article_image_usage')
      .select(
        `
        image_id,
        article_images (*)
      `
      )
      .eq('article_id', articleId);

    if (!usageRecords?.length) {
      return;
    }

    // Remove usage records
    await supabase
      .from('article_image_usage')
      .delete()
      .eq('article_id', articleId);

    // Process each image
    for (const usage of usageRecords) {
      const image = Array.isArray(usage.article_images)
        ? usage.article_images[0]
        : usage.article_images;
      if (!image) continue;

      const newReferenceCount = Math.max(0, image.reference_count - 1);

      if (newReferenceCount === 0) {
        // Delete from storage and database
        await supabase.storage.from('article-images').remove([image.file_path]);

        await supabase.from('article_images').delete().eq('id', image.id);
      } else {
        // Update reference count
        await supabase
          .from('article_images')
          .update({
            reference_count: newReferenceCount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', image.id);
      }
    }
  } catch (error) {
    console.error('Error cleaning up article images:', error);
    throw error;
  }
};

/**
 * Finds and removes orphaned images (images with 0 references).
 * @returns {Promise<void>}
 */
const cleanupOrphanedImages = async () => {
  const supabase = await createClient();

  try {
    const { data: orphanedImages } = await supabase
      .from('article_images')
      .select('*')
      .eq('reference_count', 0);

    if (!orphanedImages?.length) {
      return;
    }

    // Delete from storage
    const filePaths = orphanedImages.map((img) => img.file_path);
    await supabase.storage.from('article-images').remove(filePaths);

    // Delete from database
    const imageIds = orphanedImages.map((img) => img.id);
    await supabase.from('article_images').delete().in('id', imageIds);

    console.log(`Cleaned up ${orphanedImages.length} orphaned images`);
  } catch (error) {
    console.error('Error cleaning up orphaned images:', error);
    throw error;
  }
};

export {
  type Media,
  type MediaType,
  type MediaUpload,
  upload,
  removeImageFromArticle,
  cleanupArticleImages,
  cleanupOrphanedImages,
};
