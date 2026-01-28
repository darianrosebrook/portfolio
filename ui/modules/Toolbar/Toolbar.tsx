import React from 'react';
import { Editor } from '@tiptap/react';
import styles from './Toolbar.module.scss';
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
    <div className={styles.toolbar}>
      {/* Text style selector */}
      <select value={getActiveTextStyle()} onChange={handleTextStyleChange}>
        <option value="0">Paragraph</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>
      
      <div className={styles.separator} />
      
      {/* Text formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? styles.isActive : ''}
        title="Bold"
      >
        <Icon icon={faBold} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? styles.isActive : ''}
        title="Italic"
      >
        <Icon icon={faItalic} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? styles.isActive : ''}
        title="Underline"
      >
        <Icon icon={faUnderline} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? styles.isActive : ''}
        title="Strikethrough"
      >
        <Icon icon={faStrikethrough} />
      </button>
      
      <div className={styles.separator} />
      
      {/* Alignment */}
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={
          editor.isActive({ textAlign: 'left' }) ? styles.isActive : ''
        }
        title="Align left"
      >
        <Icon icon={faAlignLeft} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={
          editor.isActive({ textAlign: 'center' }) ? styles.isActive : ''
        }
        title="Align center"
      >
        <Icon icon={faAlignCenter} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={
          editor.isActive({ textAlign: 'right' }) ? styles.isActive : ''
        }
        title="Align right"
      >
        <Icon icon={faAlignRight} />
      </button>
      
      <div className={styles.separator} />
      
      {/* Color picker */}
      <input
        type="color"
        onChange={(event) =>
          editor.chain().focus().setColor(event.target.value).run()
        }
        value={editor.getAttributes('textStyle').color || '#000000'}
        title="Text color"
      />
      
      <div className={styles.separator} />
      
      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? styles.isActive : ''}
        title="Bullet list"
      >
        <Icon icon={faListUl} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? styles.isActive : ''}
        title="Numbered list"
      >
        <Icon icon={faListOl} />
      </button>
      
      <div className={styles.separator} />
      
      {/* Blocks */}
      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
        title="Insert table"
      >
        <Icon icon={faTable} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? styles.isActive : ''}
        title="Quote"
      >
        <Icon icon={faQuoteLeft} />
      </button>
      <button 
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal rule"
      >
        <Icon icon={faMinus} />
      </button>
      <button
        onClick={() => editor.chain().focus().setDetails('Details').run()}
        title="Insert Details Section"
      >
        <Icon icon={faChevronDown} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTableOfContents().run()}
        title="Insert Table of Contents"
      >
        <Icon icon={faList} />
      </button>
      
      <div className={styles.separator} />
      
      {/* History */}
      <button 
        onClick={() => editor.chain().focus().undo().run()}
        title="Undo"
      >
        <Icon icon={faUndo} />
      </button>
      <button 
        onClick={() => editor.chain().focus().redo().run()}
        title="Redo"
      >
        <Icon icon={faRedo} />
      </button>
    </div>
  );
};

export default Toolbar;
