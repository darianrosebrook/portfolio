import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';

// import SlashCommand from './Extensions/SlashCommand';
// import CodeBlockComponent from './Extensions/CodeBlockExtended/CodeBlockComponent';
// import ImageExtended from './Extensions/ImageExtended/ImageExtended';

/**
 * Creates optimized Tiptap extensions configuration
 * This function was part of the bundle optimization to reduce initial load
 */
export const createExtensions = (_articleId?: string) => {
  return [
    StarterKit.configure({
      // Optimize by disabling unused features
      dropcursor: {
        color: 'var(--color-primary)',
        width: 2,
      },
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'editor-image',
      },
    }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    TextStyle,
    Color,
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === 'heading') {
          return "What's the title?";
        }
        return 'Start writing or type "/" for commands...';
      },
    }),
    // TODO: Re-enable extended features after fixing TypeScript issues
    // CodeBlockComponent,
    // SlashCommand.configure({
    //   articleId,
    // }),
  ];
};
