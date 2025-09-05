import { Editor, Range } from '@tiptap/core';
import { byPrefixAndName } from '@awesome.me/kit-0ba7f5fefb/icons';

// Safe icon imports with fallbacks
const getIcon = (prefix: string, name: string) => {
  try {
    return byPrefixAndName[prefix]?.[name] || null;
  } catch {
    return null;
  }
};

const faH1 = getIcon('far', 'heading') || getIcon('fas', 'heading');
const faH2 = getIcon('far', 'heading') || getIcon('fas', 'heading');
const faH3 = getIcon('far', 'heading') || getIcon('fas', 'heading');
const faListUl = getIcon('far', 'list-ul') || getIcon('fas', 'list');
const faListOl = getIcon('far', 'list-ol') || getIcon('fas', 'list-ol');
const faQuoteLeft =
  getIcon('far', 'quote-left') || getIcon('fas', 'quote-left-alt');
const faCode = getIcon('far', 'code') || getIcon('fas', 'code');

export interface Command {
  title: string;
  command: ({ editor, range }: { editor: Editor; range: Range }) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

export const commands: Command[] = [
  {
    title: 'Heading 1',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 1 })
        .run();
    },
    icon: faH1,
  },
  {
    title: 'Heading 2',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 2 })
        .run();
    },
    icon: faH2,
  },
  {
    title: 'Heading 3',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 3 })
        .run();
    },
    icon: faH3,
  },
  {
    title: 'Bulleted List',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
    icon: faListUl,
  },
  {
    title: 'Numbered List',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
    icon: faListOl,
  },
  {
    title: 'Blockquote',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
    icon: faQuoteLeft,
  },
  {
    title: 'Code Block',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
    icon: faCode,
  },
];
