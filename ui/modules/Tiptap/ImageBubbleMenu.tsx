'use client';

import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';

type Props = {
  editor: Editor;
};

const ImageBubbleMenu: React.FC<Props> = ({ editor }) => {
  const [caption, setCaption] = useState<string>(
    (editor.getAttributes('image')?.caption as string) ?? ''
  );

  // Keep caption state in sync when selection changes
  useEffect(() => {
    const update = () => {
      const next = (editor.getAttributes('image')?.caption as string) ?? '';
      setCaption((current) => (current === next ? current : next));
    };
    editor.on('selectionUpdate', update);
    return () => {
      editor.off('selectionUpdate', update);
    };
  }, [editor]);

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
    <BubbleMenu
      editor={editor}
      pluginKey="imageBubbleMenu"
      shouldShow={({ editor: currentEditor }) =>
        currentEditor.isActive('image')
      }
      options={{ placement: 'top' }}
      className="image-bubble-menu"
      style={{
        display: 'grid',
        gridAutoFlow: 'column',
        alignItems: 'center',
        gap: '8px',
        background: 'var(--semantic-color-background-secondary)',
        border: '1px solid var(--semantic-color-border-primary)',
        borderRadius: 'var(--core-shape-radius-medium)',
        padding: '6px 8px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
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
        aria-label="Image caption"
        style={{
          minWidth: '200px',
          border: '1px solid var(--semantic-color-border-primary)',
          borderRadius: 'var(--core-shape-radius-medium)',
          background: 'var(--semantic-color-background-primary)',
          color: 'var(--color-text-primary)',
          padding: '4px 6px',
        }}
      />
    </BubbleMenu>
  );
};

export default ImageBubbleMenu;
