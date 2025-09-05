import { NodeViewWrapper } from '@tiptap/react';
import { NodeViewProps } from '@tiptap/core';
import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
  position: number;
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
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const maxDepth = node.attrs.maxDepth || 3;
  const showNumbers = node.attrs.showNumbers || false;

  const generateToc = () => {
    if (!editor) return;

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

          items.push({
            id,
            text,
            level,
            position: pos,
          });
        }
      }
    });

    setTocItems(items);
  };

  useEffect(() => {
    generateToc();
  }, [editor, maxDepth]);

  // Listen for document changes to update TOC
  useEffect(() => {
    if (!editor) return;

    const updateToc = () => {
      generateToc();
    };

    editor.on('update', updateToc);
    editor.on('selectionUpdate', updateToc);

    return () => {
      editor.off('update', updateToc);
      editor.off('selectionUpdate', updateToc);
    };
  }, [editor]);

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

    return (
      <div
        key={`${item.id}-${item.position}`}
        className={`toc-item toc-level-${item.level}`}
        style={{ paddingLeft: `${indent}px` }}
        onClick={() => scrollToHeading(item.position)}
      >
        <span className="toc-text">
          {number}
          {item.text}
        </span>
      </div>
    );
  };

  return (
    <NodeViewWrapper
      as="div"
      className={`table-of-contents-node ${selected ? 'selected' : ''}`}
      data-drag-handle
    >
      <div className="toc-container">
        <div className="toc-header">
          <h3>Table of Contents</h3>
          <div className="toc-controls">
            <button
              onClick={() => generateToc()}
              className="toc-refresh-btn"
              title="Refresh TOC"
            >
              ↻
            </button>
          </div>
        </div>

        {tocItems.length > 0 ? (
          <div className="toc-list">{tocItems.map(renderTocItem)}</div>
        ) : (
          <div className="toc-empty">
            <p>
              No headings found. Add some headings to generate a table of
              contents.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .table-of-contents-node {
          margin: 24px 0;
          border: 2px solid transparent;
          border-radius: 8px;
          transition: border-color 0.2s ease;
        }

        .table-of-contents-node.selected {
          border-color: #3b82f6;
        }

        .toc-container {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
        }

        .toc-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
        }

        .toc-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }

        .toc-controls {
          display: flex;
          gap: 8px;
        }

        .toc-refresh-btn {
          background: none;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          padding: 4px 8px;
          cursor: pointer;
          font-size: 14px;
          color: #64748b;
          transition: all 0.2s ease;
        }

        .toc-refresh-btn:hover {
          background: #e2e8f0;
          border-color: #94a3b8;
        }

        .toc-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .toc-item {
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
          margin: 2px 0;
        }

        .toc-item:hover {
          background: #e2e8f0;
        }

        .toc-text {
          font-size: 14px;
          color: #475569;
          line-height: 1.4;
        }

        .toc-level-1 .toc-text {
          font-weight: 600;
          color: #1e293b;
        }

        .toc-level-2 .toc-text {
          font-weight: 500;
        }

        .toc-empty {
          text-align: center;
          padding: 20px;
          color: #64748b;
        }

        .toc-empty p {
          margin: 0;
          font-size: 14px;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .toc-container {
            background: #1e293b;
            border-color: #334155;
          }

          .toc-header {
            border-bottom-color: #334155;
          }

          .toc-header h3 {
            color: #f1f5f9;
          }

          .toc-refresh-btn {
            border-color: #475569;
            color: #94a3b8;
          }

          .toc-refresh-btn:hover {
            background: #334155;
            border-color: #64748b;
          }

          .toc-item:hover {
            background: #334155;
          }

          .toc-text {
            color: #94a3b8;
          }

          .toc-level-1 .toc-text {
            color: #f1f5f9;
          }

          .toc-empty {
            color: #94a3b8;
          }
        }
      `}</style>
    </NodeViewWrapper>
  );
};
