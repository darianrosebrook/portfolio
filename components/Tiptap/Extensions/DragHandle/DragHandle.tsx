import { Extension } from '@tiptap/core';

export const DragHandle = Extension.create({
  name: 'dragHandle',

  addOptions() {
    return {
      types: ['heading', 'paragraph'],
    };
  },

  onTransaction({ transaction }) {
    const { doc, selection } = transaction;
    const { from, to } = selection;

    if (from !== to) {
      return;
    }

    doc.nodesBetween(from - 1, to + 1, (node, pos) => {
      if (this.options.types.includes(node.type.name)) {
        const currentDraggable = node.attrs.draggable;
        const newDraggable = true; // For simplicity, always make it draggable for now

        if (currentDraggable !== newDraggable) {
          transaction.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            draggable: newDraggable,
          });
        }
      }
    });
  },
});

export default DragHandle;
