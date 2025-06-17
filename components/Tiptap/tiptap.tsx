'use client';

import {
  useEditor,
  EditorContent,
  JSONContent,
  ReactNodeViewRenderer,
} from '@tiptap/react';
import styles from './tiptap.module.css';
import StarterKit from '@tiptap/starter-kit';
import ImageExtended from './Extensions/ImageExtended/ImageExtended';
import Document from '@tiptap/extension-document';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import CharacterCount from '@tiptap/extension-character-count';
import css from 'highlight.js/lib/languages/css';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import { common, createLowlight } from 'lowlight';

import CodeBlockComponent from './Extensions/CodeBlockExtended/CodeBlockComponent';
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
    content,
    extensions: [
      CharacterCount,
      ImageExtended.configure({
        articleId: article?.id,
      }),
      CustomDocument,
      StarterKit.configure({
        document: false,
      }),
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
    ],
    onUpdate: ({ editor }) => {
      if (handleUpdate) {
        const articleBody = editor.getJSON();
        const wordCount = editor.storage.characterCount.words();
        handleUpdate({ ...article, articleBody, wordCount });
      }
    },
  });

  return <EditorContent editor={editor} className={styles.editor} />;
};

export default Tiptap;
