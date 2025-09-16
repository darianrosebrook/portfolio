'use client';

import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import styles from './Editor.module.scss';

import { createExtensions } from '../Tiptap/extensions';
import ImageBubbleMenu from '../Tiptap/ImageBubbleMenu';
import VideoBubbleMenu from '../Tiptap/VideoBubbleMenu';
import ToolbarWrapper from '../Tiptap/ToolbarWrapper';

import { Article } from '@/types';

export interface EditorProps {
  article: Article;
  handleUpdate?: (article: Article) => void;
}

const Editor: React.FC<EditorProps> = ({
  article,
  handleUpdate = () => {},
}) => {
  const content = article.articleBody as JSONContent | undefined;
  const editor = useEditor({
    extensions: createExtensions(article?.id as unknown as number),
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
      {editor && <ToolbarWrapper editor={editor} />}
      {editor && <ImageBubbleMenu editor={editor} />}
      {editor && <VideoBubbleMenu editor={editor} />}
      <EditorContent editor={editor} className={styles.editor} />
    </>
  );
};

export { Editor };
export default Editor;
