'use client';

import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import styles from './tiptap.module.css';
import 'tippy.js/dist/tippy.css';

import { createExtensions } from './extensions';
import ToolbarWrapper from './ToolbarWrapper';

import { Article } from '@/types';

const Tiptap = ({
  article,
  handleUpdate = () => {},
}: {
  article: Article;
  handleUpdate?: (article: Article) => void;
}) => {
  const content = article.articleBody as JSONContent | undefined;
  const editor = useEditor({
    extensions: createExtensions(article?.id?.toString()),
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
      {editor && <ToolbarWrapper editor={editor} />}
    </>
  );
};

export default Tiptap;
