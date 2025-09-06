import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import Image from '@tiptap/extension-image';
import { generateHTML } from '@tiptap/html';
import { JSONContent } from '@tiptap/react';
// Use server-safe nodes to avoid importing React NodeViews on the server
import { DetailsServer } from '@/modules/Tiptap/Extensions/Details/DetailsServer';
import { TableOfContentsServer } from '@/modules/Tiptap/Extensions/TableOfContents/TableOfContentsServer';
import { VideoServer } from '@/modules/Tiptap/Extensions/VideoExtended/VideoServer';

export type CaseStudyContent = {
  h1FromHTML: RegExpMatchArray | null;
  imageFromHTML: RegExpMatchArray | null;
  html: string;
};

export function getCaseStudyContent(
  data?: JSONContent | null
): CaseStudyContent {
  const safeData: JSONContent =
    (data as JSONContent) ?? ({ type: 'doc', content: [] } as JSONContent);

  // Sanitize content to remove/convert unsupported nodes before rendering
  const sanitizedData: JSONContent = sanitizeTiptapContent(safeData);

  let html: string = generateHTML(sanitizedData, [
    CharacterCount,
    Image,
    VideoServer,
    StarterKit,
    DetailsServer,
    TableOfContentsServer,
  ]);
  // Normalize namespaces and attributes the serializer adds (e.g., xmlns)
  html = html.replace(/\s+xmlns="[^"]*"/g, '');

  // Remove only the first H1 and the first IMG, if present
  const h1FromHTML = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/);
  const imageFromHTML = html.match(/<img[^>]*?>/);

  if (h1FromHTML) {
    html = html.replace(h1FromHTML[0], '');
  }
  if (imageFromHTML) {
    html = html.replace(imageFromHTML[0], '');
  }

  return { h1FromHTML, imageFromHTML, html };
}

/**
 * Recursively sanitize Tiptap JSON to ensure only supported nodes appear.
 * - Removes unknown nodes like `detailsSummary`.
 * - If a `details` node contains a `detailsSummary` child, moves its text into
 *   the `summary` attribute of the parent and drops the child.
 */
function sanitizeTiptapContent(root: JSONContent): JSONContent {
  const sanitizeNode = (node: JSONContent): JSONContent | null => {
    if (!node) return null;

    // Drop unsupported node types entirely
    if (node.type === 'detailsSummary') {
      return null;
    }

    const next: JSONContent = { ...node };
    const children: JSONContent[] = Array.isArray(node.content)
      ? (node.content as JSONContent[])
      : [];

    // If this is a details node, capture summary from an existing detailsSummary child
    if (node.type === 'details') {
      let summaryText = '';
      const remainingChildren: JSONContent[] = [];
      for (const child of children) {
        if (child.type === 'detailsSummary') {
          summaryText = extractText(child);
        } else {
          remainingChildren.push(child);
        }
      }
      next.attrs = {
        ...(node.attrs || {}),
        summary: (node.attrs as any)?.summary ?? summaryText,
      };
      next.content = remainingChildren
        .map((c) => sanitizeNode(c))
        .filter((c): c is JSONContent => Boolean(c));
      return next;
    }

    // Recurse for all other nodes
    if (children.length > 0) {
      next.content = children
        .map((c) => sanitizeNode(c))
        .filter((c): c is JSONContent => Boolean(c));
    }

    return next;
  };

  return sanitizeNode(root) ?? { type: 'doc', content: [] };
}

function extractText(node: JSONContent): string {
  if (!node) return '';
  if (node.type === 'text' && typeof node.text === 'string') {
    return node.text;
  }
  const children: JSONContent[] = Array.isArray(node.content)
    ? (node.content as JSONContent[])
    : [];
  return children
    .map((c) => extractText(c))
    .join(' ')
    .trim();
}
