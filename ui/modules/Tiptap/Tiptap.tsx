'use client';

import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import styles from './tiptap.module.css';

import { createExtensions } from './extensionsConfig';
import ImageBubbleMenu from './ImageBubbleMenu';
import VideoBubbleMenu from './VideoBubbleMenu';
import ToolbarWrapper from './ToolbarWrapper';

import { Article } from '@/types';

const Tiptap = ({
  article,
  handleUpdate = () => {},
  editable = true,
  autofocus = false,
}: {
  article: Article;
  handleUpdate?: (article: Article) => void;
  editable?: boolean;
  autofocus?: boolean;
}) => {
  const content = article.articleBody as JSONContent | undefined;
  const editor = useEditor({
    extensions: createExtensions(article?.id as unknown as number),
    immediatelyRender: false,
    content: content,
    editable,
    autofocus,
    onUpdate: ({ editor }) => {
      if (handleUpdate) {
        const articleBody = editor.getJSON();
        handleUpdate({ ...article, articleBody });
      }
    },
  });

  return (
    <>
      {editor && <ToolbarWrapper editor={editor} />}
      {editor && <ImageBubbleMenu editor={editor} />}
      {editor && <VideoBubbleMenu editor={editor} />}
      <EditorContent editor={editor} className={styles.editor} />
    </>
  );
};

export default Tiptap;
