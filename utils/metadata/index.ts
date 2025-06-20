import { JSONContent } from '@tiptap/core';

export interface TocEntry {
  level: number;
  text: string;
  id: string;
}

export interface ArticleMetadata {
  title: string | null;
  description: string | null;
  coverImage: string | null;
  wordCount: number;
  toc: TocEntry[];
}

function countWords(node: JSONContent): number {
  let count = 0;
  if (node.text) {
    count += node.text.trim().split(/\s+/).length;
  }
  if (node.content) {
    node.content.forEach((child) => {
      count += countWords(child);
    });
  }
  return count;
}

export function extractMetadata(doc: JSONContent): ArticleMetadata {
  const metadata: ArticleMetadata = {
    title: null,
    description: null,
    coverImage: null,
    wordCount: 0,
    toc: [],
  };

  if (!doc.content) {
    return metadata;
  }

  metadata.wordCount = countWords(doc);

  doc.content.forEach((node) => {
    if (node.type === 'heading') {
      const level = node.attrs?.level;
      const text = node.content?.[0]?.text || '';
      const id = node.attrs?.id || '';
      if (text) {
        metadata.toc.push({ level, text, id });
      }
    }
  });

  // Find the first h1 for the title
  const titleNode = doc.content.find(
    (node) => node.type === 'heading' && node.attrs?.level === 1
  );
  if (titleNode && titleNode.content) {
    metadata.title = titleNode.content[0]?.text || null;
  }

  // Find the first paragraph for the description
  const descriptionNode = doc.content.find((node) => node.type === 'paragraph');
  if (descriptionNode && descriptionNode.content) {
    metadata.description = descriptionNode.content[0]?.text || null;
  }

  // Find the first image for the cover image
  const imageNode = doc.content.find((node) => node.type === 'image');
  if (imageNode && imageNode.attrs) {
    metadata.coverImage = imageNode.attrs.src || null;
  }

  return metadata;
}
