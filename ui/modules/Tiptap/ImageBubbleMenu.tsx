'use client';

import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import Popover from '@/ui/components/Popover';

type Props = {
  editor: Editor;
};

const ImageBubbleMenu: React.FC<Props> = ({ editor }) => {
  const isImageActive = editor.isActive('image');
  const [caption, setCaption] = useState<string>(
    (editor.getAttributes('image')?.caption as string) ?? ''
  );

  // Keep caption state in sync when selection changes
  useEffect(() => {
    const update = () => {
      const next = (editor.getAttributes('image')?.caption as string) ?? '';
      setCaption(next);
    };
    editor.on('selectionUpdate', update);
    editor.on('transaction', update);
    return () => {
      editor.off('selectionUpdate', update);
      editor.off('transaction', update);
    };
  }, [editor]);

  if (!isImageActive) return null;

  const align = (value: 'left' | 'center' | 'right') => {
    editor
      .chain()
      .focus()
      .updateAttributes('image', { 'data-align': value })
      .run();
  };

  const onCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCaption(value);
    editor.chain().focus().updateAttributes('image', { caption: value }).run();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
      }}
    >
      <Popover offset={8}>
        <Popover.Trigger as="div">
          <div
            style={{
              display: 'grid',
              gridAutoFlow: 'column',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--semantic-color-background-secondary)',
              border: '1px solid var(--semantic-color-border-primary)',
              borderRadius: 'var(--core-shape-radius-medium)',
              padding: '6px 8px',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                className={
                  editor.isActive('image', { 'data-align': 'left' })
                    ? 'is-active'
                    : ''
                }
                onClick={() => align('left')}
                title="Align left"
              >
                L
              </button>
              <button
                className={
                  editor.isActive('image', { 'data-align': 'center' })
                    ? 'is-active'
                    : ''
                }
                onClick={() => align('center')}
                title="Align center"
              >
                C
              </button>
              <button
                className={
                  editor.isActive('image', { 'data-align': 'right' })
                    ? 'is-active'
                    : ''
                }
                onClick={() => align('right')}
                title="Align right"
              >
                R
              </button>
            </div>
            <input
              type="text"
              value={caption}
              onChange={onCaptionChange}
              placeholder="Add caption…"
              style={{
                minWidth: '200px',
                border: '1px solid var(--semantic-color-border-primary)',
                borderRadius: 'var(--core-shape-radius-medium)',
                background: 'var(--semantic-color-background-primary)',
                color: 'var(--color-text-primary)',
                padding: '4px 6px',
              }}
            />
          </div>
        </Popover.Trigger>
        <Popover.Content>
          <div
            style={{
              background: 'var(--semantic-color-background-secondary)',
              border: '1px solid var(--semantic-color-border-primary)',
              borderRadius: 'var(--core-shape-radius-medium)',
              padding: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}
            >
              Image controls
            </div>
          </div>
        </Popover.Content>
      </Popover>
    </div>
  );
};

export default ImageBubbleMenu;
