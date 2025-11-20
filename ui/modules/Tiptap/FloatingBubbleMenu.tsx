'use client';

import Icon from '@/ui/components/Icon';
import { byPrefixAndName } from '@awesome.me/kit-0ba7f5fefb/icons';
import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import React, { useState } from 'react';
import { LinkEditor } from './LinkEditor';

const faBold = byPrefixAndName['far']['bold'];
const faItalic = byPrefixAndName['far']['italic'];
const faUnderline = byPrefixAndName['far']['toilet-paper-under'];
const faStrikethrough = byPrefixAndName['far']['strikethrough'];
const faCode = byPrefixAndName['far']['code'];
const faLink = byPrefixAndName['far']['link'];
const faHighlighter = byPrefixAndName['far']['highlighter'];

interface FloatingBubbleMenuProps {
  editor: Editor;
}

/**
 * Floating bubble menu that appears on text selection
 * Similar to Notion's formatting toolbar
 */
export const FloatingBubbleMenu: React.FC<FloatingBubbleMenuProps> = ({
  editor,
}) => {
  const [showLinkEditor, setShowLinkEditor] = useState(false);

  const getLinkUrl = () => {
    const { href } = editor.getAttributes('link');
    return href || '';
  };

  const setLink = () => {
    setShowLinkEditor(true);
  };

  if (showLinkEditor) {
    return (
      <BubbleMenu
        editor={editor}
        options={{
          placement: 'top',
        }}
        className="floating-bubble-menu"
      >
        <LinkEditor
          editor={editor}
          onClose={() => setShowLinkEditor(false)}
          initialUrl={getLinkUrl()}
        />
      </BubbleMenu>
    );
  }

  return (
    <BubbleMenu
      editor={editor}
      options={{
        placement: 'top',
      }}
      className="floating-bubble-menu"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          background: 'var(--semantic-color-background-primary)',
          border: '1px solid var(--semantic-color-border-primary)',
          borderRadius: 'var(--core-shape-radius-medium)',
          padding: '4px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          title="Bold (⌘B)"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            border: 'none',
            background: editor.isActive('bold')
              ? 'var(--semantic-color-background-accent)'
              : 'transparent',
            borderRadius: 'var(--core-shape-radius-small)',
            cursor: 'pointer',
            color: editor.isActive('bold')
              ? 'var(--semantic-color-foreground-accent)'
              : 'var(--semantic-color-foreground-primary)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!editor.isActive('bold')) {
              e.currentTarget.style.background =
                'var(--semantic-color-background-secondary)';
            }
          }}
          onMouseLeave={(e) => {
            if (!editor.isActive('bold')) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <Icon icon={faBold} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          title="Italic (⌘I)"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            border: 'none',
            background: editor.isActive('italic')
              ? 'var(--semantic-color-background-accent)'
              : 'transparent',
            borderRadius: 'var(--core-shape-radius-small)',
            cursor: 'pointer',
            color: editor.isActive('italic')
              ? 'var(--semantic-color-foreground-accent)'
              : 'var(--semantic-color-foreground-primary)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!editor.isActive('italic')) {
              e.currentTarget.style.background =
                'var(--semantic-color-background-secondary)';
            }
          }}
          onMouseLeave={(e) => {
            if (!editor.isActive('italic')) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <Icon icon={faItalic} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'is-active' : ''}
          title="Underline (⌘U)"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            border: 'none',
            background: editor.isActive('underline')
              ? 'var(--semantic-color-background-accent)'
              : 'transparent',
            borderRadius: 'var(--core-shape-radius-small)',
            cursor: 'pointer',
            color: editor.isActive('underline')
              ? 'var(--semantic-color-foreground-accent)'
              : 'var(--semantic-color-foreground-primary)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!editor.isActive('underline')) {
              e.currentTarget.style.background =
                'var(--semantic-color-background-secondary)';
            }
          }}
          onMouseLeave={(e) => {
            if (!editor.isActive('underline')) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <Icon icon={faUnderline} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
          title="Strikethrough"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            border: 'none',
            background: editor.isActive('strike')
              ? 'var(--semantic-color-background-accent)'
              : 'transparent',
            borderRadius: 'var(--core-shape-radius-small)',
            cursor: 'pointer',
            color: editor.isActive('strike')
              ? 'var(--semantic-color-foreground-accent)'
              : 'var(--semantic-color-foreground-primary)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!editor.isActive('strike')) {
              e.currentTarget.style.background =
                'var(--semantic-color-background-secondary)';
            }
          }}
          onMouseLeave={(e) => {
            if (!editor.isActive('strike')) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <Icon icon={faStrikethrough} />
        </button>

        <div
          style={{
            width: '1px',
            height: '20px',
            background: 'var(--semantic-color-border-primary)',
            margin: '0 2px',
          }}
        />

        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'is-active' : ''}
          title="Code"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            border: 'none',
            background: editor.isActive('code')
              ? 'var(--semantic-color-background-accent)'
              : 'transparent',
            borderRadius: 'var(--core-shape-radius-small)',
            cursor: 'pointer',
            color: editor.isActive('code')
              ? 'var(--semantic-color-foreground-accent)'
              : 'var(--semantic-color-foreground-primary)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!editor.isActive('code')) {
              e.currentTarget.style.background =
                'var(--semantic-color-background-secondary)';
            }
          }}
          onMouseLeave={(e) => {
            if (!editor.isActive('code')) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <Icon icon={faCode} />
        </button>

        <button
          onClick={setLink}
          className={editor.isActive('link') ? 'is-active' : ''}
          title="Link (⌘K)"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            border: 'none',
            background: editor.isActive('link')
              ? 'var(--semantic-color-background-accent)'
              : 'transparent',
            borderRadius: 'var(--core-shape-radius-small)',
            cursor: 'pointer',
            color: editor.isActive('link')
              ? 'var(--semantic-color-foreground-accent)'
              : 'var(--semantic-color-foreground-primary)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!editor.isActive('link')) {
              e.currentTarget.style.background =
                'var(--semantic-color-background-secondary)';
            }
          }}
          onMouseLeave={(e) => {
            if (!editor.isActive('link')) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <Icon icon={faLink} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={editor.isActive('highlight') ? 'is-active' : ''}
          title="Highlight"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            border: 'none',
            background: editor.isActive('highlight')
              ? 'var(--semantic-color-background-accent)'
              : 'transparent',
            borderRadius: 'var(--core-shape-radius-small)',
            cursor: 'pointer',
            color: editor.isActive('highlight')
              ? 'var(--semantic-color-foreground-accent)'
              : 'var(--semantic-color-foreground-primary)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!editor.isActive('highlight')) {
              e.currentTarget.style.background =
                'var(--semantic-color-background-secondary)';
            }
          }}
          onMouseLeave={(e) => {
            if (!editor.isActive('highlight')) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <Icon icon={faHighlighter} />
        </button>
      </div>
    </BubbleMenu>
  );
};
