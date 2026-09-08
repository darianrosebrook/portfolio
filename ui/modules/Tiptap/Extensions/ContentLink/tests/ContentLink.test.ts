// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { generateHTML, generateJSON } from '@tiptap/html';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { ContentLinkServer } from '../ContentLinkServer';

/**
 * Round-trip contract for the contentLink node: saved documents are Tiptap
 * JSON, public pages render HTML, and pasted/previewed HTML must parse back
 * into identical attrs. Any drift here silently corrupts links.
 */

const extensions = () => [Document, Paragraph, Text, ContentLinkServer];

const resolvedDoc = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'contentLink',
          attrs: {
            id: 42,
            contentType: 'case-study',
            slug: 'design-systems',
            title: 'Design systems case study',
            resolved: true,
          },
        },
      ],
    },
  ],
};

describe('ContentLinkServer', () => {
  it('renders resolved links with a slug as anchors', () => {
    const html = generateHTML(resolvedDoc as never, extensions());

    expect(html).toContain('<a');
    expect(html).toContain('href="/work/design-systems"');
    expect(html).toContain('class="content-link case-study"');
    expect(html).toContain('data-content-link="true"');
    expect(html).toContain('data-id="42"');
    expect(html).toContain('data-resolved="true"');
    expect(html).toContain('Design systems case study</a>');
  });

  it('renders unresolved links as labeled spans', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'contentLink',
              attrs: {
                id: null,
                contentType: null,
                slug: null,
                title: 'Mystery title',
                resolved: false,
              },
            },
          ],
        },
      ],
    };

    const html = generateHTML(doc as never, extensions());

    expect(html).toContain('<span');
    expect(html).toContain('class="content-link pending"');
    expect(html).not.toContain('<a');
    expect(html).toContain('Mystery title</span>');
  });

  it('renders resolved-but-unmatched links as invalid spans', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'contentLink',
              attrs: {
                id: null,
                contentType: null,
                slug: null,
                title: 'Dangling',
                resolved: true,
              },
            },
          ],
        },
      ],
    };

    const html = generateHTML(doc as never, extensions());
    expect(html).toContain('class="content-link invalid"');
  });

  it('round-trips HTML back into identical JSON attrs', () => {
    const html = generateHTML(resolvedDoc as never, extensions());
    const json = generateJSON(html, extensions());

    const paragraph = json.content?.[0];
    const node = paragraph?.content?.[0];

    expect(node).toMatchObject({
      type: 'contentLink',
      attrs: {
        id: 42,
        contentType: 'case-study',
        slug: 'design-systems',
        title: 'Design systems case study',
        resolved: true,
      },
    });
  });

  it('round-trips article links to the /articles URL space', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'contentLink',
              attrs: {
                id: 7,
                contentType: 'article',
                slug: 'my-article',
                title: 'My article',
                resolved: true,
              },
            },
          ],
        },
      ],
    };

    const html = generateHTML(doc as never, extensions());
    expect(html).toContain('href="/articles/my-article"');

    const json = generateJSON(html, extensions());
    expect(json.content?.[0]?.content?.[0]).toMatchObject({
      attrs: { id: 7, contentType: 'article', slug: 'my-article' },
    });
  });
});
