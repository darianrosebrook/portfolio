/**
 * Shared schema pieces for the contentLink node, consumed by both the
 * interactive editor extension and the server-safe variant. Keeping attrs,
 * parsing, and HTML rendering in one place prevents the two from drifting.
 *
 * Round-trip contract: nodes serialize to `<a>` (resolved, has slug) or
 * `<span>` (pending/invalid) carrying a `data-content-link` marker plus
 * `data-id` / `data-content-type` / `data-slug` / `data-title` /
 * `data-resolved`. Both shapes parse back into identical attrs.
 */

import { mergeAttributes } from '@tiptap/core';
import type { DOMOutputSpec } from '@tiptap/pm/model';
import { contentHref } from '@/utils/supabase/contentRelations';

export const CONTENT_LINK_PARSE_HTML = [
  { tag: 'a[data-content-link]' },
  { tag: 'span[data-content-link]' },
];

export interface ContentLinkAttrs {
  id: number | null;
  contentType: 'article' | 'case-study' | null;
  slug: string | null;
  title: string;
  resolved: boolean;
}

export function contentLinkAttributes() {
  return {
    id: {
      default: null,
      parseHTML: (element: HTMLElement) => {
        const value = element.getAttribute('data-id');
        if (!value) return null;
        const parsed = parseInt(value, 10);
        return Number.isFinite(parsed) ? parsed : null;
      },
      renderHTML: (attributes: ContentLinkAttrs) =>
        attributes.id != null ? { 'data-id': String(attributes.id) } : {},
    },
    contentType: {
      default: null,
      parseHTML: (element: HTMLElement) =>
        element.getAttribute('data-content-type'),
      renderHTML: (attributes: ContentLinkAttrs) =>
        attributes.contentType
          ? { 'data-content-type': attributes.contentType }
          : {},
    },
    slug: {
      default: null,
      parseHTML: (element: HTMLElement) => element.getAttribute('data-slug'),
      renderHTML: (attributes: ContentLinkAttrs) =>
        attributes.slug ? { 'data-slug': attributes.slug } : {},
    },
    title: {
      default: '',
      parseHTML: (element: HTMLElement) =>
        element.getAttribute('data-title') ?? element.textContent ?? '',
      renderHTML: (attributes: ContentLinkAttrs) =>
        attributes.title ? { 'data-title': attributes.title } : {},
    },
    resolved: {
      default: false,
      parseHTML: (element: HTMLElement) =>
        element.getAttribute('data-resolved') === 'true',
      renderHTML: (attributes: ContentLinkAttrs) => ({
        'data-resolved': String(Boolean(attributes.resolved)),
      }),
    },
  };
}

/**
 * Render a contentLink node to HTML. Resolved links with a slug become real
 * anchors (readers get navigation without JS); everything else renders as a
 * labeled span so no state is lost.
 */
export function renderContentLinkHTML(
  attrs: ContentLinkAttrs,
  HTMLAttributes: Record<string, unknown>
): DOMOutputSpec {
  const { id, contentType, slug, title, resolved } = attrs;

  const dataAttrs: Record<string, string> = {
    'data-content-link': 'true',
    'data-resolved': String(Boolean(resolved)),
  };
  if (id != null) dataAttrs['data-id'] = String(id);
  if (contentType) dataAttrs['data-content-type'] = contentType;
  if (slug) dataAttrs['data-slug'] = slug;
  if (title) dataAttrs['data-title'] = title;

  if (resolved && contentType && slug) {
    return [
      'a',
      mergeAttributes(HTMLAttributes, dataAttrs, {
        href: contentHref(contentType, slug),
        class: `content-link ${contentType}`,
      }),
      title,
    ];
  }

  return [
    'span',
    mergeAttributes(HTMLAttributes, dataAttrs, {
      class: `content-link ${resolved ? 'invalid' : 'pending'}`,
    }),
    title,
  ];
}
