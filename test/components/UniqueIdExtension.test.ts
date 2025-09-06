import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Heading from '@tiptap/extension-heading';
import Text from '@tiptap/extension-text';
import { UniqueIdExtension } from '@/modules/Tiptap/Extensions/UniqueId/UniqueIdExtension';

describe('UniqueIdExtension', () => {
  it('adds collision-free ids to duplicate headings', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Heading, Text, UniqueIdExtension],
      content: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Intro' }],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Intro' }],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Intro' }],
          },
        ],
      },
    });

    const doc = editor.state.doc;
    const ids: string[] = [];
    doc.descendants((node) => {
      if (node.type.name === 'heading') {
        ids.push(node.attrs.id);
      }
    });

    expect(ids).toEqual(['intro', 'intro-2', 'intro-3']);
  });
});
