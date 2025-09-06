import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface DragHandleOptions {
  /**
   * CSS class for the drag handle
   */
  dragHandleClass: string;
  /**
   * CSS class for the drag handle when hovering
   */
  dragHandleHoverClass: string;
  /**
   * CSS class for the drag handle when dragging
   */
  dragHandleDraggingClass: string;
  /**
   * Types of nodes that can be dragged
   */
  draggableTypes: string[];
  /**
   * Whether to show drag handles on all draggable nodes
   */
  showDragHandles: boolean;
}

/**
 * Drag Handle extension for Tiptap
 * Adds drag handles to draggable nodes for better content reordering UX
 *
 * @author @darianrosebrook
 */
export const DragHandleExtension = Extension.create<DragHandleOptions>({
  name: 'dragHandle',

  addOptions() {
    return {
      dragHandleClass: 'drag-handle',
      dragHandleHoverClass: 'drag-handle-hover',
      dragHandleDraggingClass: 'drag-handle-dragging',
      draggableTypes: [
        'paragraph',
        'heading',
        'blockquote',
        'details',
        'tableOfContents',
      ],
      showDragHandles: true,
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('dragHandle'),
        props: {
          decorations: (state) => {
            if (!this.options.showDragHandles) {
              return DecorationSet.empty;
            }

            const decorations: Decoration[] = [];
            const { doc, selection } = state;

            doc.descendants((node, pos) => {
              if (this.options.draggableTypes.includes(node.type.name)) {
                // Don't show drag handle if node is selected
                if (
                  selection.from <= pos &&
                  selection.to >= pos + node.nodeSize
                ) {
                  return;
                }

                const decoration = Decoration.widget(
                  pos,
                  () => {
                    const handle = document.createElement('div');
                    handle.className = this.options.dragHandleClass;
                    handle.setAttribute('data-drag-handle', 'true');
                    handle.innerHTML = '⋮⋮';
                    handle.style.cssText = `
                      position: absolute;
                      left: -20px;
                      top: 0;
                      width: 16px;
                      height: 100%;
                      cursor: grab;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: var(--color-text-tertiary);
                      font-size: 12px;
                      line-height: 1;
                      opacity: 0;
                      transition: opacity 0.2s ease;
                      user-select: none;
                      z-index: 10;
                    `;

                    // Add hover effects
                    handle.addEventListener('mouseenter', () => {
                      handle.style.opacity = '1';
                      handle.style.color = 'var(--color-accent)';
                    });

                    handle.addEventListener('mouseleave', () => {
                      handle.style.opacity = '0';
                      handle.style.color = 'var(--color-text-tertiary)';
                    });

                    // Add drag functionality
                    handle.addEventListener('mousedown', (e) => {
                      e.preventDefault();
                      handle.style.cursor = 'grabbing';
                      handle.classList.add(
                        this.options.dragHandleDraggingClass
                      );

                      // Trigger drag start
                      const dragEvent = new DragEvent('dragstart', {
                        bubbles: true,
                        cancelable: true,
                        dataTransfer: new DataTransfer(),
                      });

                      handle.dispatchEvent(dragEvent);
                    });

                    return handle;
                  },
                  {
                    side: -1,
                    key: `drag-handle-${pos}`,
                  }
                );

                decorations.push(decoration);
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-h': () => {
        this.options.showDragHandles = !this.options.showDragHandles;
        this.editor.view.dispatch(this.editor.state.tr);
        return true;
      },
    };
  },
});
