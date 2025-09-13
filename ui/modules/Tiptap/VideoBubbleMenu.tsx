import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';

interface VideoBubbleMenuProps {
  editor: Editor;
}

/**
 * Video Bubble Menu Component
 * Provides contextual editing options for video nodes
 */
const VideoBubbleMenu: React.FC<VideoBubbleMenuProps> = ({ editor }) => {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showUrlInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showUrlInput]);

  if (!editor) {
    return null;
  }

  const handleUrlSubmit = () => {
    if (urlValue) {
      editor.chain().focus().updateAttributes('video', { src: urlValue }).run();
      setShowUrlInput(false);
      setUrlValue('');
    }
  };

  const handleUrlCancel = () => {
    setShowUrlInput(false);
    setUrlValue('');
  };

  const handleAlignLeft = () => {
    editor
      .chain()
      .focus()
      .updateAttributes('video', { 'data-align': 'left' })
      .run();
  };

  const handleAlignCenter = () => {
    editor
      .chain()
      .focus()
      .updateAttributes('video', { 'data-align': 'center' })
      .run();
  };

  const handleAlignRight = () => {
    editor
      .chain()
      .focus()
      .updateAttributes('video', { 'data-align': 'right' })
      .run();
  };

  const handleToggleControls = () => {
    const currentControls = editor.getAttributes('video').controls;
    editor
      .chain()
      .focus()
      .updateAttributes('video', { controls: !currentControls })
      .run();
  };

  const handleToggleAutoplay = () => {
    const currentAutoplay = editor.getAttributes('video').autoplay;
    editor
      .chain()
      .focus()
      .updateAttributes('video', { autoplay: !currentAutoplay })
      .run();
  };

  const handleToggleLoop = () => {
    const currentLoop = editor.getAttributes('video').loop;
    editor
      .chain()
      .focus()
      .updateAttributes('video', { loop: !currentLoop })
      .run();
  };

  const handleToggleMuted = () => {
    const currentMuted = editor.getAttributes('video').muted;
    editor
      .chain()
      .focus()
      .updateAttributes('video', { muted: !currentMuted })
      .run();
  };

  const handleDelete = () => {
    editor.chain().focus().deleteSelection().run();
  };

  const currentAttrs = editor.getAttributes('video');

  if (!editor.isActive('video')) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: 'var(--semantic-color-background-primary)',
        border: '1px solid var(--semantic-color-border-primary)',
        borderRadius: 'var(--core-shape-radius-medium)',
        padding: 'var(--core-spacing-size-02)',
        boxShadow: 'var(--shadow-02)',
      }}
    >
      {showUrlInput ? (
        <div
          style={{
            display: 'flex',
            gap: 'var(--core-spacing-size-01)',
            alignItems: 'center',
          }}
        >
          <input
            ref={inputRef}
            type="url"
            placeholder="Enter video URL..."
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleUrlSubmit();
              } else if (e.key === 'Escape') {
                handleUrlCancel();
              }
            }}
            style={{
              padding:
                'var(--core-spacing-size-01) var(--core-spacing-size-02)',
              border: '1px solid var(--semantic-color-border-primary)',
              borderRadius: 'var(--core-shape-radius-small)',
              fontSize: 'var(--font-size-sm)',
              minWidth: '200px',
            }}
          />
          <button
            onClick={handleUrlSubmit}
            title="Update URL"
            style={{
              padding:
                'var(--core-spacing-size-01) var(--core-spacing-size-02)',
              background: 'var(--color-accent)',
              color: 'var(--color-accent-contrast)',
              border: 'none',
              borderRadius: 'var(--core-shape-radius-small)',
              cursor: 'pointer',
            }}
          >
            ✓
          </button>
          <button
            onClick={handleUrlCancel}
            title="Cancel"
            style={{
              padding:
                'var(--core-spacing-size-01) var(--core-spacing-size-02)',
              background: 'var(--semantic-color-background-secondary)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--semantic-color-border-primary)',
              borderRadius: 'var(--core-shape-radius-small)',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            gap: 'var(--core-spacing-size-02)',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--core-spacing-size-01)' }}>
            <button
              onClick={() => {
                setUrlValue(currentAttrs.src || '');
                setShowUrlInput(true);
              }}
              title="Change video URL"
              style={{
                padding:
                  'var(--core-spacing-size-01) var(--core-spacing-size-02)',
                background: 'transparent',
                border: '1px solid var(--semantic-color-border-primary)',
                borderRadius: 'var(--core-shape-radius-small)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              🔗
            </button>
          </div>

          <div style={{ display: 'flex', gap: 'var(--core-spacing-size-01)' }}>
            <button
              onClick={handleAlignLeft}
              style={{
                padding:
                  'var(--core-spacing-size-01) var(--core-spacing-size-02)',
                background:
                  currentAttrs['data-align'] === 'left'
                    ? 'var(--color-accent)'
                    : 'transparent',
                color:
                  currentAttrs['data-align'] === 'left'
                    ? 'var(--color-accent-contrast)'
                    : 'var(--color-text-secondary)',
                border: '1px solid var(--semantic-color-border-primary)',
                borderRadius: 'var(--core-shape-radius-small)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
              }}
              title="Align left"
            >
              ⬅️
            </button>
            <button
              onClick={handleAlignCenter}
              style={{
                padding:
                  'var(--core-spacing-size-01) var(--core-spacing-size-02)',
                background:
                  currentAttrs['data-align'] === 'center'
                    ? 'var(--color-accent)'
                    : 'transparent',
                color:
                  currentAttrs['data-align'] === 'center'
                    ? 'var(--color-accent-contrast)'
                    : 'var(--color-text-secondary)',
                border: '1px solid var(--semantic-color-border-primary)',
                borderRadius: 'var(--core-shape-radius-small)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
              }}
              title="Align center"
            >
              ↔️
            </button>
            <button
              onClick={handleAlignRight}
              style={{
                padding:
                  'var(--core-spacing-size-01) var(--core-spacing-size-02)',
                background:
                  currentAttrs['data-align'] === 'right'
                    ? 'var(--color-accent)'
                    : 'transparent',
                color:
                  currentAttrs['data-align'] === 'right'
                    ? 'var(--color-accent-contrast)'
                    : 'var(--color-text-secondary)',
                border: '1px solid var(--semantic-color-border-primary)',
                borderRadius: 'var(--core-shape-radius-small)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
              }}
              title="Align right"
            >
              ➡️
            </button>
          </div>

          <div style={{ display: 'flex', gap: 'var(--core-spacing-size-01)' }}>
            <button
              onClick={handleToggleControls}
              style={{
                padding:
                  'var(--core-spacing-size-01) var(--core-spacing-size-02)',
                background: currentAttrs.controls
                  ? 'var(--color-accent)'
                  : 'transparent',
                color: currentAttrs.controls
                  ? 'var(--color-accent-contrast)'
                  : 'var(--color-text-secondary)',
                border: '1px solid var(--semantic-color-border-primary)',
                borderRadius: 'var(--core-shape-radius-small)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
              }}
              title="Toggle controls"
            >
              🎛️
            </button>
            <button
              onClick={handleToggleAutoplay}
              style={{
                padding:
                  'var(--core-spacing-size-01) var(--core-spacing-size-02)',
                background: currentAttrs.autoplay
                  ? 'var(--color-accent)'
                  : 'transparent',
                color: currentAttrs.autoplay
                  ? 'var(--color-accent-contrast)'
                  : 'var(--color-text-secondary)',
                border: '1px solid var(--semantic-color-border-primary)',
                borderRadius: 'var(--core-shape-radius-small)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
              }}
              title="Toggle autoplay"
            >
              ▶️
            </button>
            <button
              onClick={handleToggleLoop}
              style={{
                padding:
                  'var(--core-spacing-size-01) var(--core-spacing-size-02)',
                background: currentAttrs.loop
                  ? 'var(--color-accent)'
                  : 'transparent',
                color: currentAttrs.loop
                  ? 'var(--color-accent-contrast)'
                  : 'var(--color-text-secondary)',
                border: '1px solid var(--semantic-color-border-primary)',
                borderRadius: 'var(--core-shape-radius-small)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
              }}
              title="Toggle loop"
            >
              🔄
            </button>
            <button
              onClick={handleToggleMuted}
              style={{
                padding:
                  'var(--core-spacing-size-01) var(--core-spacing-size-02)',
                background: currentAttrs.muted
                  ? 'var(--color-accent)'
                  : 'transparent',
                color: currentAttrs.muted
                  ? 'var(--color-accent-contrast)'
                  : 'var(--color-text-secondary)',
                border: '1px solid var(--semantic-color-border-primary)',
                borderRadius: 'var(--core-shape-radius-small)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
              }}
              title="Toggle muted"
            >
              🔇
            </button>
          </div>

          <div style={{ display: 'flex', gap: 'var(--core-spacing-size-01)' }}>
            <button
              onClick={handleDelete}
              title="Delete video"
              style={{
                padding:
                  'var(--core-spacing-size-01) var(--core-spacing-size-02)',
                background: 'var(--color-danger)',
                color: 'var(--color-danger-contrast)',
                border: 'none',
                borderRadius: 'var(--core-shape-radius-small)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              🗑️
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoBubbleMenu;
