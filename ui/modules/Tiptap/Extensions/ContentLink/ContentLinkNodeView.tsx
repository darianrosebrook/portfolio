'use client';

import { useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

/**
 * Editor view for a contentLink node.
 *
 * Nodes inserted via the [[title]] input rule start unresolved; this view
 * resolves them against the search API once. Resolution policy is exact
 * case-insensitive title match only — anything looser risks silently binding
 * a link to the wrong piece of content. No match becomes an "invalid" node
 * the author can delete or retype.
 */
export const ContentLinkNodeView = ({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) => {
  const { id, contentType, slug, title, resolved } = node.attrs as {
    id: number | null;
    contentType: 'article' | 'case-study' | null;
    slug: string | null;
    title: string;
    resolved: boolean;
  };

  useEffect(() => {
    if (resolved || !title) return;

    let cancelled = false;
    const controller = new AbortController();

    const resolve = async () => {
      try {
        const response = await fetch(
          `/api/search-content?q=${encodeURIComponent(title)}&limit=1`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error('Content search failed');
        const { data } = await response.json();
        const match = Array.isArray(data) ? data[0] : null;
        if (cancelled) return;

        if (match && match.title?.toLowerCase() === title.toLowerCase()) {
          updateAttributes({
            id: match.id,
            contentType: match.type,
            slug: match.slug,
            resolved: true,
          });
        } else {
          updateAttributes({ resolved: true });
        }
      } catch (error) {
        if (!cancelled && (error as Error).name !== 'AbortError') {
          updateAttributes({ resolved: true });
        }
      }
    };

    resolve();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [resolved, title, updateAttributes]);

  const isValid = resolved && id != null && contentType && slug;
  const stateClass = isValid ? contentType : resolved ? 'invalid' : 'pending';
  const stateLabel = isValid
    ? `Link to ${contentType === 'article' ? 'article' : 'case study'}`
    : resolved
      ? 'Unresolved content link'
      : 'Resolving content link…';

  return (
    <NodeViewWrapper
      as="span"
      className={`content-link ${stateClass}${selected ? ' selected' : ''}`}
      contentEditable={false}
      data-content-link="true"
      title={stateLabel}
    >
      {title}
    </NodeViewWrapper>
  );
};
