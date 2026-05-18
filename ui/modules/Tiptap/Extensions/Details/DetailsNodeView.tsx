'use client';

import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { NodeViewProps } from '@tiptap/core';
import { Details } from '@/ui/components/Details';
import { useState } from 'react';
import './DetailsNodeView.css';

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
      data-ds-component="DetailsNodeView"
      className={`${selected ? 'selected' : ''}`}
      data-drag-handle
    >
      <div className='detailsEditor'>
        {/* Summary input for editing */}
        <div className='summaryEditor'>
          <input
            type="text"
            value={summary}
            onChange={handleSummaryChange}
            placeholder="Enter summary text..."
            className='summaryInput'
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Details component */}
        <Details
          open={isOpen}
          summary={summary}
          onToggle={handleToggle}
          className='detailsContent'
        >
          <NodeViewContent />
        </Details>
      </div>
    </NodeViewWrapper>
  );
};
