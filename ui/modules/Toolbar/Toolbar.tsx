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

type ToolbarProps = {
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
      <select value={getActiveTextStyle()} onChange={handleTextStyleChange}>
        <option value="0">Paragraph</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? styles.isActive : ''}
      >
        <Icon icon={faBold} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? styles.isActive : ''}
      >
        <Icon icon={faItalic} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? styles.isActive : ''}
      >
        <Icon icon={faUnderline} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? styles.isActive : ''}
      >
        <Icon icon={faStrikethrough} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={
          editor.isActive({ textAlign: 'left' }) ? styles.isActive : ''
        }
      >
        <Icon icon={faAlignLeft} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={
          editor.isActive({ textAlign: 'center' }) ? styles.isActive : ''
        }
      >
        <Icon icon={faAlignCenter} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={
          editor.isActive({ textAlign: 'right' }) ? styles.isActive : ''
        }
      >
        <Icon icon={faAlignRight} />
      </button>
      <input
        type="color"
        onInput={(event: React.ChangeEvent<HTMLInputElement>) =>
          editor.chain().focus().setColor(event.target.value).run()
        }
        value={editor.getAttributes('textStyle').color || '#000000'}
      />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? styles.isActive : ''}
      >
        <Icon icon={faListUl} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? styles.isActive : ''}
      >
        <Icon icon={faListOl} />
      </button>
      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
      >
        <Icon icon={faTable} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? styles.isActive : ''}
      >
        <Icon icon={faQuoteLeft} />
      </button>
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
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
      <button onClick={() => editor.chain().focus().undo().run()}>
        <Icon icon={faUndo} />
      </button>
      <button onClick={() => editor.chain().focus().redo().run()}>
        <Icon icon={faRedo} />
      </button>
    </div>
  );
};

export default Toolbar;
