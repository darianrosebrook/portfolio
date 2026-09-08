/**
 * Extensions for the interactive client editor only.
 *
 * Kept out of extensionsRegistry so the server/preview rendering path never
 * imports them: DragHandle transitively pulls in yjs (via the collaboration
 * packages), which otherwise loads twice during static page generation and
 * trips Yjs's duplicate-import guard. See yjs/yjs#438.
 */
import DragHandle from '@tiptap/extension-drag-handle';
import type { Extension } from '@tiptap/core';

export function createEditorOnlyExtensions(): Extension[] {
  return [
    DragHandle.configure({
      render: () => {
        const element = document.createElement('button');
        element.type = 'button';
        element.classList.add('editor-drag-handle');
        element.setAttribute('aria-label', 'Drag block to reorder');
        element.title = 'Drag to reorder';
        element.textContent = '⋮⋮';
        element.style.visibility = 'hidden';
        element.style.pointerEvents = 'none';
        return element;
      },
    }),
  ] as Extension[];
}
