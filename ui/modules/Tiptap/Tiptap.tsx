'use client';

import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import { useEffect, useRef } from 'react';
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
  const articleRef = useRef(article);
  
  // Keep articleRef in sync with latest article prop
  useEffect(() => {
    articleRef.current = article;
  }, [article]);
  
  const editor = useEditor({
    extensions: createExtensions(article?.id as unknown as number),
    immediatelyRender: false,
    content: content,
    editable,
    autofocus,
    onUpdate: ({ editor }) => {
      if (handleUpdate) {
        const articleBody = editor.getJSON();
        // Use ref to get latest article state to avoid stale closure
        handleUpdate({ ...articleRef.current, articleBody });
      }
    },
  });

  // Sync editor content when article.articleBody changes externally
  // (e.g., when loading from localStorage or server)
  useEffect(() => {
    if (editor && content) {
      const currentContent = JSON.stringify(editor.getJSON());
      const newContent = JSON.stringify(content);
      
      // Only update if content is actually different to avoid cursor jumps
      if (currentContent !== newContent) {
        editor.commands.setContent(content, { emitUpdate: false });
      }
    }
  }, [editor, content]);

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
