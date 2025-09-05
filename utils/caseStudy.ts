import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import Image from '@tiptap/extension-image';
import { generateHTML } from '@tiptap/html';
import { JSONContent } from '@tiptap/react';

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

  let html: string = generateHTML(safeData, [
    CharacterCount,
    Image,
    StarterKit,
  ]);
  const h1FromHTML = html.match(/<h1>(.*?)<\/h1>/);
  const imageFromHTML = html.match(/<img(.*?)>/);

  if (h1FromHTML) {
    html = html.replace(h1FromHTML[0], '');
  }
  if (imageFromHTML) {
    html = html.replace(imageFromHTML[0], '');
  }

  return { h1FromHTML, imageFromHTML, html };
}
