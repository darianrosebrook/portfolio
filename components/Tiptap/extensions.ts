import StarterKit from '@tiptap/starter-kit';
import Document from '@tiptap/extension-document';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { Markdown } from 'tiptap-markdown';
import Heading from '@tiptap/extension-heading';
import Paragraph from '@tiptap/extension-paragraph';
import Gapcursor from '@tiptap/extension-gapcursor';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { createLowlight, common } from 'lowlight';
import css from 'highlight.js/lib/languages/css';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';

import { DraggableNode } from './Extensions/DraggableNode';
import CodeBlockComponent from './Extensions/CodeBlockExtended/CodeBlockComponent';
import ImageExtended from './Extensions/ImageExtended/ImageExtended';
import SlashCommand from './Extensions/SlashCommand';

const lowlight = createLowlight(common);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('js', js);
lowlight.register('javascript', js);
lowlight.register('typescript', ts);

const CustomDocument = Document.extend({
  content: 'heading block*',
});

export const createExtensions = (articleId?: number) => [
  ImageExtended.configure({
    articleId,
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
];
