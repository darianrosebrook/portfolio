import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { NodeViewProps } from '@tiptap/core';
import { Details } from '@/components/Details';
import { useState } from 'react';

/**
 * Node view component for the Details extension
 * Renders the Details component within the Tiptap editor
 *
 * @author @darianrosebrook
 */
export const DetailsNodeView: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  selected,
  editor,
}) => {
  const [isOpen, setIsOpen] = useState(node.attrs.open ?? false);
  const summary = node.attrs.summary || 'Details';

  const handleToggle = (open: boolean) => {
    setIsOpen(open);
    updateAttributes({ open });
  };

  const handleSummaryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSummary = event.target.value;
    updateAttributes({ summary: newSummary });
  };

  return (
    <NodeViewWrapper
      as="div"
      className={`details-node-view ${selected ? 'selected' : ''}`}
      data-drag-handle
    >
      <div className="details-editor">
        {/* Summary input for editing */}
        <div className="summary-editor">
          <input
            type="text"
            value={summary}
            onChange={handleSummaryChange}
            placeholder="Enter summary text..."
            className="summary-input"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Details component */}
        <Details
          open={isOpen}
          summary={summary}
          onToggle={handleToggle}
          className="details-content"
        >
          <NodeViewContent />
        </Details>
      </div>

      <style jsx>{`
        .details-node-view {
          margin: 16px 0;
          border: 2px solid transparent;
          border-radius: 8px;
          transition: border-color 0.2s ease;
        }

        .details-node-view.selected {
          border-color: #3b82f6;
        }

        .details-editor {
          position: relative;
        }

        .summary-editor {
          margin-bottom: 8px;
        }

        .summary-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          background: #f9fafb;
          transition: all 0.2s ease;
        }

        .summary-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .details-content {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .details-content :global(.summary) {
          background: #f3f4f6;
          border-bottom: 1px solid #e5e7eb;
        }

        .details-content :global(.content) {
          background: #ffffff;
        }
      `}</style>
    </NodeViewWrapper>
  );
};
