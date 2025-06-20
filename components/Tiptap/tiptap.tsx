'use client';

import {
  useEditor,
  EditorContent,
  JSONContent,
  ReactNodeViewRenderer,
  BubbleMenu,
} from '@tiptap/react';
import styles from './tiptap.module.css';
import 'tippy.js/dist/tippy.css';
import StarterKit from '@tiptap/starter-kit';
import ImageExtended from './Extensions/ImageExtended/ImageExtended';
import Document from '@tiptap/extension-document';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import css from 'highlight.js/lib/languages/css';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import { common, createLowlight } from 'lowlight';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { Markdown } from 'tiptap-markdown';
import SlashCommand from './Extensions/SlashCommand';
import Heading from '@tiptap/extension-heading';
import Paragraph from '@tiptap/extension-paragraph';
import Gapcursor from '@tiptap/extension-gapcursor';
import { DraggableNode } from './Extensions/DraggableNode';

import CodeBlockComponent from './Extensions/CodeBlockExtended/CodeBlockComponent';
import Toolbar from '../Toolbar/Toolbar';
import ImageToolbar from '../Toolbar/ImageToolbar';
const lowlight = createLowlight(common);

lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('js', js);
lowlight.register('ts', ts);

import { Article } from '@/types';

const CustomDocument = Document.extend({
  content: 'heading block*',
});

const Tiptap = ({
  article,
  handleUpdate = null,
}: {
  article: Article;
  handleUpdate?: (article: Article) => void;
}) => {
  const content = article.articleBody as JSONContent | undefined;
  const editor = useEditor({
    extensions: [
      ImageExtended.configure({
        articleId: article?.id,
      }),
      CustomDocument,
      StarterKit.configure({
        document: false,
        heading: false,
        paragraph: false,
        gapcursor: false,
        codeBlock: false,
      }),
      Gapcursor,
      Paragraph.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            draggable: {
              default: true,
            },
          };
        },
        addNodeView() {
          return ReactNodeViewRenderer(DraggableNode);
        },
      }),
      Heading.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            id: {
              default: null,
            },
            draggable: {
              default: true,
            },
          };
        },
        addNodeView() {
          return ReactNodeViewRenderer(DraggableNode);
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return "What's the title?";
          }
          return 'Can you add some further context?';
        },
      }),
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        },
      }).configure({ lowlight }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Markdown,
      SlashCommand,
    ],
    immediatelyRender: false,
    content: content,
    onUpdate: ({ editor }) => {
      if (handleUpdate) {
        const articleBody = editor.getJSON();
        handleUpdate({ ...article, articleBody });
      }
    },
  });

  return (
    <>
      <EditorContent editor={editor} className={styles.editor} />
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          shouldShow={({ editor, view, state }) => {
            const { selection } = state;
            const { empty } = selection;
            const isEmpty = empty;
            const hasFocus = view.hasFocus();
            const isTextSelection = !isEmpty && hasFocus;

            if (editor.isActive('codeBlock')) {
              return false;
            }

            return isTextSelection;
          }}
        >
          <Toolbar editor={editor} />
        </BubbleMenu>
      )}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          shouldShow={({ editor }) => editor.isActive('image')}
        >
          <ImageToolbar editor={editor} />
        </BubbleMenu>
      )}
    </>
  );
};

export default Tiptap;
