'use client';

import Icon from '@/ui/components/Icon';
import { byPrefixAndName } from '@awesome.me/kit-0ba7f5fefb/icons';
import { Editor } from '@tiptap/react';
import { FloatingMenu } from '@tiptap/react/menus';
import React, { useState } from 'react';

const faCopy = byPrefixAndName['far']['copy'];
const faTrash = byPrefixAndName['far']['trash'];
const faChevronDown = byPrefixAndName['far']['chevron-down'];

interface FloatingBlockMenuProps {
  editor: Editor;
}

/**
 * Floating block menu that appears on hover over blocks
 * Similar to Notion's block menu with actions like duplicate, delete, and "Turn into"
 */
export const FloatingBlockMenu: React.FC<FloatingBlockMenuProps> = ({
  editor,
}) => {
  const [showTurnInto, setShowTurnInto] = useState(false);

  const shouldShow = ({ editor: editorInstance }: { editor: Editor }) => {
    const { selection } = editorInstance.state;
    const { empty, from } = selection;

    // Only show when there's no text selection (empty cursor)
    if (!empty) {
      return false;
    }

    // Check if we're at the start of a block
    const $pos = editorInstance.state.doc.resolve(from);
    const isBlockStart = $pos.parentOffset === 0;

    return isBlockStart;
  };

  const getCurrentNodeType = () => {
    const { from } = editor.state.selection;
    const $pos = editor.state.doc.resolve(from);
    return $pos.parent.type.name;
  };

  const duplicateBlock = () => {
    const { from, to } = editor.state.selection;
    const $pos = editor.state.doc.resolve(from);
    const node = $pos.parent;

    // Get the content of the current block
    const content = node.content;
    const nodeSize = node.nodeSize;

    // Insert the duplicated content after the current block
    editor.commands.insertContentAt(to + nodeSize, {
      type: node.type.name,
      attrs: node.attrs,
      content: content.toJSON(),
    });
  };

  const deleteBlock = () => {
    const { from } = editor.state.selection;
    const $pos = editor.state.doc.resolve(from);
    const node = $pos.parent;

    // Delete the entire block
    editor.commands.deleteRange({
      from: from - $pos.parentOffset,
      to: from - $pos.parentOffset + node.nodeSize,
    });
  };

  const turnInto = (type: string) => {
    const { from } = editor.state.selection;
    const $pos = editor.state.doc.resolve(from);
    const node = $pos.parent;

    // Get the content
    const content = node.content.toJSON();

    // Turn into different types
    switch (type) {
      case 'paragraph':
        editor.chain().focus().setParagraph().run();
        break;
      case 'heading1':
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'heading2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'heading3':
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'blockquote':
        editor.chain().focus().toggleBlockquote().run();
        break;
      case 'codeBlock':
        editor.chain().focus().toggleCodeBlock().run();
        break;
      default:
        break;
    }

    setShowTurnInto(false);
  };

  const currentNodeType = getCurrentNodeType();
  const turnIntoOptions = [
    {
      type: 'paragraph',
      label: 'Paragraph',
      disabled: currentNodeType === 'paragraph',
    },
    {
      type: 'heading1',
      label: 'Heading 1',
      disabled:
        currentNodeType === 'heading' &&
        editor.getAttributes('heading').level === 1,
    },
    {
      type: 'heading2',
      label: 'Heading 2',
      disabled:
        currentNodeType === 'heading' &&
        editor.getAttributes('heading').level === 2,
    },
    {
      type: 'heading3',
      label: 'Heading 3',
      disabled:
        currentNodeType === 'heading' &&
        editor.getAttributes('heading').level === 3,
    },
    {
      type: 'bulletList',
      label: 'Bullet List',
      disabled: currentNodeType === 'bulletList',
    },
    {
      type: 'orderedList',
      label: 'Numbered List',
      disabled: currentNodeType === 'orderedList',
    },
    {
      type: 'blockquote',
      label: 'Quote',
      disabled: currentNodeType === 'blockquote',
    },
    {
      type: 'codeBlock',
      label: 'Code Block',
      disabled: currentNodeType === 'codeBlock',
    },
  ].filter((opt) => !opt.disabled);

  return (
    <FloatingMenu
      editor={editor}
      shouldShow={shouldShow}
      options={{
        placement: 'left-start',
        offset: 8,
      }}
      className="floating-block-menu"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          background: 'var(--semantic-color-background-primary)',
          border: '1px solid var(--semantic-color-border-primary)',
          borderRadius: 'var(--core-shape-radius-medium)',
          padding: '4px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          minWidth: '32px',
          position: 'relative',
        }}
      >
        {showTurnInto && turnIntoOptions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              left: '100%',
              top: 0,
              marginLeft: '4px',
              background: 'var(--semantic-color-background-primary)',
              border: '1px solid var(--semantic-color-border-primary)',
              borderRadius: 'var(--core-shape-radius-medium)',
              padding: '4px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              minWidth: '160px',
              zIndex: 1001,
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: '600',
                padding: '6px 8px',
                color: 'var(--semantic-color-foreground-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Turn into
            </div>
            {turnIntoOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => turnInto(option.type)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '6px 8px',
                  border: 'none',
                  background: 'transparent',
                  borderRadius: 'var(--core-shape-radius-small)',
                  cursor: 'pointer',
                  color: 'var(--semantic-color-foreground-primary)',
                  fontSize: '14px',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    'var(--semantic-color-background-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {turnIntoOptions.length > 0 && (
          <button
            onClick={() => setShowTurnInto(!showTurnInto)}
            title="Turn into"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              border: 'none',
              background: showTurnInto
                ? 'var(--semantic-color-background-accent)'
                : 'transparent',
              borderRadius: 'var(--core-shape-radius-small)',
              cursor: 'pointer',
              color: showTurnInto
                ? 'var(--semantic-color-foreground-accent)'
                : 'var(--semantic-color-foreground-primary)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!showTurnInto) {
                e.currentTarget.style.background =
                  'var(--semantic-color-background-secondary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!showTurnInto) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <div
              style={{ transform: showTurnInto ? 'rotate(180deg)' : 'none' }}
            >
              <Icon icon={faChevronDown} />
            </div>
          </button>
        )}

        <button
          onClick={duplicateBlock}
          title="Duplicate block"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            border: 'none',
            background: 'transparent',
            borderRadius: 'var(--core-shape-radius-small)',
            cursor: 'pointer',
            color: 'var(--semantic-color-foreground-primary)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              'var(--semantic-color-background-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Icon icon={faCopy} />
        </button>

        <button
          onClick={deleteBlock}
          title="Delete block"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            border: 'none',
            background: 'transparent',
            borderRadius: 'var(--core-shape-radius-small)',
            cursor: 'pointer',
            color: 'var(--semantic-color-foreground-primary)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              'var(--semantic-color-background-secondary)';
            e.currentTarget.style.color =
              'var(--semantic-color-foreground-destructive)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color =
              'var(--semantic-color-foreground-primary)';
          }}
        >
          <Icon icon={faTrash} />
        </button>
      </div>
    </FloatingMenu>
  );
};
