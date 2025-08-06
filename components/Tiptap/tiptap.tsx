'use client';

import {
  useEditor,
  EditorContent,
  JSONContent,
  BubbleMenu,
} from '@tiptap/react';
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
    extensions: createExtensions(article?.id),
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
          <ToolbarWrapper editor={editor} />
        </BubbleMenu>
      )}
    </>
  );
};

export default Tiptap;
