import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { NodeViewProps } from '@tiptap/core';
import { Details } from '@/ui/components/Details';
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
          border-radius: var(--core-shape-radius-medium);
          transition: border-color 0.2s ease;
        }

        .details-node-view.selected {
          border-color: var(--color-accent);
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
          border: 1px solid var(--semantic-color-border-primary);
          border-radius: var(--core-shape-radius-medium);
          font-size: 14px;
          font-weight: 600;
          background: var(--semantic-color-background-secondary);
          transition: all 0.2s ease;
        }

        .summary-input:focus {
          outline: none;
          border-color: var(--color-accent);
          background: var(--semantic-color-background-primary);
          box-shadow: 0 0 0 3px
            color-mix(in srgb, var(--color-accent) 10%, transparent);
        }

        .details-content {
          border: 1px solid var(--semantic-color-border-primary);
          border-radius: var(--core-shape-radius-medium);
          overflow: hidden;
        }

        .details-content :global(.summary) {
          background: var(--semantic-color-background-tertiary);
          border-bottom: 1px solid var(--semantic-color-border-primary);
        }

        .details-content :global(.content) {
          background: var(--semantic-color-background-primary);
        }
      `}</style>
    </NodeViewWrapper>
  );
};
