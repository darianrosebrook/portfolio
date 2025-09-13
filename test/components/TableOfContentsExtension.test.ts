import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Heading from '@tiptap/extension-heading';
import Text from '@tiptap/extension-text';
import { TableOfContentsExtension } from '@/ui/modules/Tiptap/Extensions/TableOfContents/TableOfContentsExtension';

describe('TableOfContentsExtension', () => {
  it('inserts a toc node with defaults', () => {
    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Heading,
        Text,
        TableOfContentsExtension,
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'A' }],
          },
          { type: 'paragraph', content: [{ type: 'text', text: 'Body' }] },
        ],
      },
    });

    editor.commands.setTableOfContents();

    // Ensure the toc node exists
    let hasToc = false;
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'tableOfContents') hasToc = true;
    });
    expect(hasToc).toBe(true);
  });
});
