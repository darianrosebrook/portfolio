import { generateHTML } from '@tiptap/html';
import type { JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

/**
 * Process case study content by removing the first h1 and first image,
 * then converting to HTML
 */
export function getCaseStudyContent(data: JSONContent): { html: string } {
  if (!data || !data.content) {
    return { html: '' };
  }

  // Create a copy of the content array
  const content = [...data.content];

  // Remove first h1 if it exists
  const firstH1Index = content.findIndex(
    (node) => node.type === 'heading' && node.attrs?.level === 1
  );
  if (firstH1Index !== -1) {
    content.splice(firstH1Index, 1);
  }

  // Remove first image if it exists
  const firstImageIndex = content.findIndex((node) => node.type === 'image');
  if (firstImageIndex !== -1) {
    content.splice(firstImageIndex, 1);
  }

  // Generate HTML from the modified content using basic extensions
  const html = generateHTML(
    {
      type: 'doc',
      content,
    },
    [StarterKit]
  );

  return { html };
}
