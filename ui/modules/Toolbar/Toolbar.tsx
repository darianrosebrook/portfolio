import React from 'react';
import { Editor } from '@tiptap/react';
import './Toolbar.css';
import Icon from '../../components/Icon';
import { byPrefixAndName } from '@awesome.me/kit-0ba7f5fefb/icons';
const faBold = byPrefixAndName['far']['bold'];
const faItalic = byPrefixAndName['far']['italic'];
const faUnderline = byPrefixAndName['far']['toilet-paper-under'];
const faStrikethrough = byPrefixAndName['far']['strikethrough'];
const faAlignLeft = byPrefixAndName['far']['align-left'];
const faAlignCenter = byPrefixAndName['far']['align-center'];
const faAlignRight = byPrefixAndName['far']['align-right'];
const faListUl = byPrefixAndName['far']['list-ul'];
const faListOl = byPrefixAndName['far']['list-ol'];
const faTable = byPrefixAndName['far']['table-list'];
const faQuoteLeft = byPrefixAndName['far']['quote-left-alt'];
const faMinus = byPrefixAndName['far']['minus'];
const faUndo = byPrefixAndName['far']['undo'];
const faRedo = byPrefixAndName['far']['redo'];
const faChevronDown = byPrefixAndName['far']['chevron-down'];
const faList = byPrefixAndName['far']['list'];

export type ToolbarProps = {
  editor: Editor | null;
};

const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const handleTextStyleChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const level = parseInt(event.target.value, 10);
    if (level === 0) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor
        .chain()
        .focus()
        .toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 })
        .run();
    }
  };

  const getActiveTextStyle = () => {
    if (editor.isActive('paragraph')) return 0;
    for (let i = 1; i <= 6; i++) {
      if (editor.isActive('heading', { level: i })) return i;
    }
    return 0;
  };

  return (
    <div
      data-ds-component="Toolbar"
      role="toolbar"
      aria-label="Editor formatting tools"
      data-slot="toolbar"
    >
      {/* Text style selector */}
      <select
        value={getActiveTextStyle()}
        onChange={handleTextStyleChange}
        aria-label="Text style"
        data-slot="text-style"
      >
        <option value="0">Paragraph</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>

      <div className="separator" data-slot="separator" />

      {/* Text formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'isActive' : ''}
        aria-pressed={editor.isActive('bold')}
        title="Bold"
        data-slot="action"
      >
        <Icon icon={faBold} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'isActive' : ''}
        aria-pressed={editor.isActive('italic')}
        title="Italic"
        data-slot="action"
      >
        <Icon icon={faItalic} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'isActive' : ''}
        aria-pressed={editor.isActive('underline')}
        title="Underline"
        data-slot="action"
      >
        <Icon icon={faUnderline} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'isActive' : ''}
        aria-pressed={editor.isActive('strike')}
        title="Strikethrough"
        data-slot="action"
      >
        <Icon icon={faStrikethrough} />
      </button>

      <div className="separator" data-slot="separator" />

      {/* Alignment */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={editor.isActive({ textAlign: 'left' }) ? 'isActive' : ''}
        aria-pressed={editor.isActive({ textAlign: 'left' })}
        title="Align left"
        data-slot="action"
      >
        <Icon icon={faAlignLeft} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={editor.isActive({ textAlign: 'center' }) ? 'isActive' : ''}
        aria-pressed={editor.isActive({ textAlign: 'center' })}
        title="Align center"
        data-slot="action"
      >
        <Icon icon={faAlignCenter} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={editor.isActive({ textAlign: 'right' }) ? 'isActive' : ''}
        aria-pressed={editor.isActive({ textAlign: 'right' })}
        title="Align right"
        data-slot="action"
      >
        <Icon icon={faAlignRight} />
      </button>

      <div className="separator" data-slot="separator" />

      {/* Color picker */}
      <input
        type="color"
        onChange={(event) =>
          editor.chain().focus().setColor(event.target.value).run()
        }
        value={editor.getAttributes('textStyle').color || '#000000'}
        aria-label="Text color"
        title="Text color"
        data-slot="color-input"
      />

      <div className="separator" data-slot="separator" />

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'isActive' : ''}
        aria-pressed={editor.isActive('bulletList')}
        title="Bullet list"
        data-slot="action"
      >
        <Icon icon={faListUl} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'isActive' : ''}
        aria-pressed={editor.isActive('orderedList')}
        title="Numbered list"
        data-slot="action"
      >
        <Icon icon={faListOl} />
      </button>

      <div className="separator" data-slot="separator" />

      {/* Blocks */}
      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
        title="Insert table"
        data-slot="action"
      >
        <Icon icon={faTable} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'isActive' : ''}
        aria-pressed={editor.isActive('blockquote')}
        title="Quote"
        data-slot="action"
      >
        <Icon icon={faQuoteLeft} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal rule"
        data-slot="action"
      >
        <Icon icon={faMinus} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setDetails('Details').run()}
        title="Insert Details Section"
        data-slot="action"
      >
        <Icon icon={faChevronDown} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTableOfContents().run()}
        title="Insert Table of Contents"
        data-slot="action"
      >
        <Icon icon={faList} />
      </button>

      <div className="separator" data-slot="separator" />

      {/* History */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        title="Undo"
        data-slot="action"
      >
        <Icon icon={faUndo} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        title="Redo"
        data-slot="action"
      >
        <Icon icon={faRedo} />
      </button>
    </div>
  );
};

export default Toolbar;
