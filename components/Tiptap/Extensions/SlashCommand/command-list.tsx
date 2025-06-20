import { Editor, Range } from '@tiptap/core';
import { byPrefixAndName } from '@awesome.me/kit-0ba7f5fefb/icons';

const faH1 = byPrefixAndName['far']['h1'];
const faH2 = byPrefixAndName['far']['h2'];
const faH3 = byPrefixAndName['far']['h3'];
const faListUl = byPrefixAndName['far']['list-ul'];
const faListOl = byPrefixAndName['far']['list-ol'];
const faQuoteLeft = byPrefixAndName['far']['quote-left'];
const faCode = byPrefixAndName['far']['code'];

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
