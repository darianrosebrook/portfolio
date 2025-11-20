import { extractMetadata } from '@/utils/metadata';
import type { JSONContent } from '@tiptap/react';
import { useMemo } from 'react';

interface ExtractedMetadata {
  headline: string | null;
  description: string | null;
  coverImage: string | null;
  wordCount: number;
}

/**
 * Hook to extract metadata from article content
 * Automatically extracts headline, description, image, and word count
 */
export function useMetadataExtraction(
  articleBody: JSONContent | null | undefined
): ExtractedMetadata {
  return useMemo(() => {
    if (!articleBody || articleBody.type !== 'doc') {
      return {
        headline: null,
        description: null,
        coverImage: null,
        wordCount: 0,
      };
    }

    const metadata = extractMetadata(articleBody);

    return {
      headline: metadata.title,
      description: metadata.description,
      coverImage: metadata.coverImage,
      wordCount: metadata.wordCount,
    };
  }, [articleBody]);
}
