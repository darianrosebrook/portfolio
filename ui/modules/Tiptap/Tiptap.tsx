'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import type { JSONContent } from '@tiptap/core';
import styles from './tiptap.module.css';

import { createEditorExtensions } from './extensionsRegistry';
import ImageBubbleMenu from './ImageBubbleMenu';
import VideoBubbleMenu from './VideoBubbleMenu';
import ToolbarWrapper from './ToolbarWrapper';

import { Article } from '@/types';
import { normalizeJSONContent } from '@/utils/tiptap/htmlGeneration';

interface TiptapProps {
  article: Article;
  handleUpdate?: (article: Article) => void;
  editable?: boolean;
  autofocus?: boolean | 'start' | 'end' | 'all';
  placeholder?: string;
  onCreate?: (props: { editor: Editor }) => void;
  onFocus?: (props: { editor: Editor }) => void;
  onBlur?: (props: { editor: Editor }) => void;
}

const Tiptap = ({
  article,
  handleUpdate = () => {},
  editable = true,
  autofocus = false,
  placeholder,
  onCreate,
  onFocus,
  onBlur,
}: TiptapProps) => {
  // Normalize content and memoize to prevent unnecessary re-renders
  const normalizedContent = useMemo(() => {
    return normalizeJSONContent(article.articleBody);
  }, [article.articleBody]);

  // Track previous content to detect external changes
  const previousContentRef = useRef<JSONContent | null>(null);

  const editor = useEditor({
    extensions: createEditorExtensions({
      articleId: article?.id as number | undefined,
    }),
    immediatelyRender: false,
    editable,
    autofocus,
    content: normalizedContent,
    onUpdate: ({ editor }) => {
      if (handleUpdate && !editor.isDestroyed && editable) {
        try {
          const articleBody = editor.getJSON();
          handleUpdate({ ...article, articleBody });
        } catch (error) {
          console.error('Error updating article:', error);
        }
      }
    },
    onCreate: ({ editor }) => {
      // Store initial content for comparison
      previousContentRef.current = editor.getJSON();
      onCreate?.({ editor });
    },
    onFocus: ({ editor }) => {
      onFocus?.({ editor });
    },
    onBlur: ({ editor }) => {
      onBlur?.({ editor });
    },
  });

  // Sync content when article prop changes externally
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const currentContent = editor.getJSON();
    const newContent = normalizedContent;

    // Deep comparison to avoid unnecessary updates
    // Only update if content actually changed externally
    if (
      JSON.stringify(currentContent) !== JSON.stringify(newContent) &&
      JSON.stringify(previousContentRef.current) !== JSON.stringify(newContent)
    ) {
      // Preserve selection when updating content
      const { from, to } = editor.state.selection;
      editor.commands.setContent(newContent, { emitUpdate: false });

      // Restore selection if possible
      try {
        if (
          from <= editor.state.doc.content.size &&
          to <= editor.state.doc.content.size
        ) {
          editor.commands.setTextSelection({ from, to });
        }
      } catch {
        // Selection may be invalid after content update, that's okay
      }

      previousContentRef.current = newContent;
    }
  }, [editor, normalizedContent]);

  // Update editable state when prop changes
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      if (editor && !editor.isDestroyed) {
        editor.destroy();
      }
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className={styles.editor} style={{ padding: '1rem' }}>
        <p>Loading editor...</p>
      </div>
    );
  }

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
