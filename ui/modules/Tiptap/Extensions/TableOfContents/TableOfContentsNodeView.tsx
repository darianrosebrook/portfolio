'use client';

import { NodeViewWrapper } from '@tiptap/react';
import { NodeViewProps, Editor } from '@tiptap/core';
import { useCallback, useRef, useSyncExternalStore } from 'react';
import './TableOfContentsNodeView.css';

interface TocItem {
  id: string;
  text: string;
  level: number;
  position: number;
}

const EMPTY_TOC: TocItem[] = [];

function computeTocItems(editor: Editor | null, maxDepth: number): TocItem[] {
  if (!editor) return EMPTY_TOC;

  const items: TocItem[] = [];
  const { doc } = editor.state;

  doc.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      const level = node.attrs.level;
      if (level <= maxDepth) {
        const text = node.textContent;
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

        items.push({ id, text, level, position: pos });
      }
    }
  });

  return items;
}

/**
 * Node view component for the Table of Contents extension
 * Renders an auto-generated TOC from document headings
 *
 * @author @darianrosebrook
 */
export const TableOfContentsNodeView: React.FC<NodeViewProps> = ({
  node,
  editor,
  selected,
}) => {
  const maxDepth = node.attrs.maxDepth || 3;
  const showNumbers = node.attrs.showNumbers || false;

  // Memoize subscribe so useSyncExternalStore doesn't re-subscribe each render.
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!editor) return () => {};
      editor.on('update', onChange);
      editor.on('selectionUpdate', onChange);
      return () => {
        editor.off('update', onChange);
        editor.off('selectionUpdate', onChange);
      };
    },
    [editor]
  );

  // useSyncExternalStore requires getSnapshot to be referentially stable when
  // the underlying state hasn't changed. Each ProseMirror transaction produces
  // a new doc instance, so we cache by (doc, maxDepth) identity.
  const cacheRef = useRef<{
    doc: unknown;
    maxDepth: number;
    items: TocItem[];
  } | null>(null);

  const getSnapshot = useCallback(() => {
    if (!editor) return EMPTY_TOC;
    const doc = editor.state.doc;
    const cached = cacheRef.current;
    if (cached && cached.doc === doc && cached.maxDepth === maxDepth) {
      return cached.items;
    }
    const items = computeTocItems(editor as Editor, maxDepth);
    cacheRef.current = { doc, maxDepth, items };
    return items;
  }, [editor, maxDepth]);

  // Server snapshot is always empty — TOC is editor-driven and client-only.
  const tocItems = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => EMPTY_TOC
  );

  const scrollToHeading = (position: number) => {
    if (!editor) return;

    // Find the heading node and scroll to it
    const { doc } = editor.state;
    const headingNode = doc.nodeAt(position);

    if (headingNode) {
      // Scroll into view
      const dom = editor.view.nodeDOM(position);
      if (dom) {
        (dom as Element).scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  };

  const renderTocItem = (item: TocItem, index: number) => {
    const indent = (item.level - 1) * 16;
    const number = showNumbers ? `${index + 1}. ` : '';
    const levelClass =
      item.level === 1
        ? 'tocLevel1'
        : item.level === 2
          ? 'tocLevel2'
          : '';

    return (
      <button
        key={`${item.id}-${item.position}`}
        type="button"
        className={`tocItem ${levelClass}`}
        style={{ paddingLeft: `${indent}px` }}
        onClick={() => scrollToHeading(item.position)}
      >
        <span className='tocText'>
          {number}
          {item.text}
        </span>
      </button>
    );
  };

  return (
    <NodeViewWrapper
      as="div"
      data-ds-component="TableOfContentsNodeView"
      className={`${selected ? 'selected' : ''}`}
      data-drag-handle
    >
      <div className='tocContainer'>
        <div className='tocHeader'>
          <h3>Table of Contents</h3>
        </div>

        {tocItems.length > 0 ? (
          <div className='tocList'>{tocItems.map(renderTocItem)}</div>
        ) : (
          <div className='tocEmpty'>
            <p>
              No headings found. Add some headings to generate a table of
              contents.
            </p>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};
