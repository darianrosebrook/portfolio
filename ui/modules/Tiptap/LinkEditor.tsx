'use client';

import Icon from '@/ui/components/Icon';
import { byPrefixAndName } from '@awesome.me/kit-0ba7f5fefb/icons';
import { Editor } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';

const faLink = byPrefixAndName['far']['link'];
const faXmark = byPrefixAndName['far']['xmark'];
const faCheck = byPrefixAndName['far']['check'];

interface LinkEditorProps {
  editor: Editor;
  onClose: () => void;
  initialUrl?: string;
}

/**
 * Inline link editor component
 * Replaces window.prompt with a proper inline editor
 */
export const LinkEditor: React.FC<LinkEditorProps> = ({
  editor,
  onClose,
  initialUrl = '',
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
    inputRef.current?.select();

    // Get existing link attributes if editing
    if (editor.isActive('link')) {
      const attrs = editor.getAttributes('link');
      setUrl(attrs.href || '');
      setTitle(attrs.title || '');
    }
  }, [editor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (url.trim() === '') {
      // Remove link if URL is empty
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      // Validate URL
      let finalUrl = url.trim();
      if (!finalUrl.match(/^https?:\/\//i) && !finalUrl.match(/^mailto:/i)) {
        finalUrl = `https://${finalUrl}`;
      }

      // Set or update link
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: finalUrl })
        .run();
    }

    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 1000,
        background: 'var(--semantic-color-background-primary)',
        border: '1px solid var(--semantic-color-border-primary)',
        borderRadius: 'var(--core-shape-radius-medium)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        padding: '12px',
        minWidth: '300px',
        maxWidth: '400px',
      }}
      onKeyDown={handleKeyDown}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '8px' }}>
          <label
            htmlFor="link-url"
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '4px',
              color: 'var(--semantic-color-foreground-secondary)',
            }}
          >
            URL
          </label>
          <input
            ref={inputRef}
            id="link-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '14px',
              border: '1px solid var(--semantic-color-border-primary)',
              borderRadius: 'var(--core-shape-radius-small)',
              background: 'var(--semantic-color-background-secondary)',
              color: 'var(--semantic-color-foreground-primary)',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.borderColor =
                'var(--semantic-color-border-accent)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor =
                'var(--semantic-color-border-primary)';
            }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label
            htmlFor="link-title"
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '4px',
              color: 'var(--semantic-color-foreground-secondary)',
            }}
          >
            Title (optional)
          </label>
          <input
            id="link-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Link title"
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '14px',
              border: '1px solid var(--semantic-color-border-primary)',
              borderRadius: 'var(--core-shape-radius-small)',
              background: 'var(--semantic-color-background-secondary)',
              color: 'var(--semantic-color-foreground-primary)',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.borderColor =
                'var(--semantic-color-border-accent)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor =
                'var(--semantic-color-border-primary)';
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              border: '1px solid var(--semantic-color-border-primary)',
              borderRadius: 'var(--core-shape-radius-small)',
              background: 'var(--semantic-color-background-secondary)',
              color: 'var(--semantic-color-foreground-primary)',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                'var(--semantic-color-background-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                'var(--semantic-color-background-secondary)';
            }}
          >
            <Icon icon={faXmark} />
            Cancel
          </button>
          <button
            type="submit"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              border: 'none',
              borderRadius: 'var(--core-shape-radius-small)',
              background: 'var(--semantic-color-background-accent)',
              color: 'var(--semantic-color-foreground-accent)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <Icon icon={faCheck} />
            Apply
          </button>
        </div>
      </form>
    </div>
  );
};
