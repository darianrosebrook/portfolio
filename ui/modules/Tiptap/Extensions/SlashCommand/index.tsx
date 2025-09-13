import { Editor, Extension, Range } from '@tiptap/core';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';

type CommandAction = (editor: Editor) => boolean;

interface SlashCommandItem {
  title: string;
  subtitle?: string;
  shortcut?: string;
  icon?: string;
  keywords?: string[];
  action: CommandAction;
}

interface SlashCommandOptions {
  items: (editor: Editor) => SlashCommandItem[];
}

const renderItems = () => {
  let component: HTMLDivElement | null = null;
  const onKeyDown: ((props: { event: KeyboardEvent }) => boolean) | null = null;

  return {
    onStart: (props: any) => {
      component = document.createElement('div');
      component.className = 'slash-command';
      Object.assign(component.style, {
        position: 'absolute',
        zIndex: '1000',
        background: 'var(--semantic-color-background-primary)',
        border: '1px solid var(--semantic-color-border-primary)',
        borderRadius: 'var(--core-shape-radius-medium)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        minWidth: '260px',
      });

      document.body.appendChild(component);

      // Position the component - using a simple approach for now
      component.style.left = '50%';
      component.style.top = '50%';
      component.style.transform = 'translate(-50%, -50%)';

      // Call onUpdate directly since we're in a closure
      if (component) {
        component.innerHTML = '';
        // This will be handled by the onUpdate function
      }
    },
    onUpdate: (props: any) => {
      if (!component) return;
      component.innerHTML = '';

      const list = document.createElement('div');
      list.style.maxHeight = '320px';
      list.style.overflowY = 'auto';
      list.style.padding = '4px';

      props.items?.forEach((item: SlashCommandItem, index: number) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'slash-item';
        Object.assign(el.style, {
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          width: '100%',
          textAlign: 'left',
          padding: '8px 10px',
          borderRadius: 'var(--core-shape-radius-medium)',
          border: 'none',
          background: 'transparent',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
        } as CSSStyleDeclaration);

        el.addEventListener('mouseenter', () =>
          props.command({
            editor: props.editor,
            range: props.range,
            props: { query: '', editor: props.editor },
          })
        );
        el.addEventListener('mousedown', (e) => {
          e.preventDefault();
          props.command({
            editor: props.editor,
            range: props.range,
            props: { query: '', editor: props.editor },
          });
        });

        const title = document.createElement('div');
        title.textContent = item.title;
        title.style.fontWeight = '600';

        const subtitle = document.createElement('div');
        subtitle.textContent = item.subtitle ?? '';
        subtitle.style.fontSize = '12px';
        subtitle.style.opacity = '0.8';

        const text = document.createElement('div');
        text.style.display = 'grid';
        text.style.gap = '2px';
        text.appendChild(title);
        if (item.subtitle) text.appendChild(subtitle);

        el.appendChild(text);
        list.appendChild(el);
      });

      component?.appendChild(list);
    },
    onKeyDown: (props: any) => {
      if (props.event.key === 'Escape') {
        props.command({
          editor: props.editor,
          range: props.range,
          props: { query: '', editor: props.editor },
        });
        return true;
      }
      return false;
    },
    onExit: () => {
      if (component) {
        component.remove();
        component = null;
      }
    },
  };
};

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: 'slashCommand',

  addOptions() {
    return {
      items: (editor) => [
        {
          title: 'Heading 1',
          subtitle: 'Large section title',
          action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
        },
        {
          title: 'Heading 2',
          subtitle: 'Section title',
          action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
          title: 'Bullet List',
          subtitle: 'Create a bulleted list',
          action: (e) => e.chain().focus().toggleBulletList().run(),
        },
        {
          title: 'Ordered List',
          subtitle: 'Create a numbered list',
          action: (e) => e.chain().focus().toggleOrderedList().run(),
        },
        {
          title: 'Task List',
          subtitle: 'Create a checklist',
          action: (e) => e.chain().focus().toggleTaskList().run(),
        },
        {
          title: 'Quote',
          subtitle: 'Insert a blockquote',
          action: (e) => e.chain().focus().toggleBlockquote().run(),
        },
        {
          title: 'Code Block',
          subtitle: 'Insert code block',
          action: (e) => e.chain().focus().toggleCodeBlock().run(),
        },
        {
          title: 'Horizontal Rule',
          subtitle: 'Insert a divider',
          action: (e) => e.chain().focus().setHorizontalRule().run(),
        },
        {
          title: 'Details',
          subtitle: 'Collapsible section',
          action: (e) => e.chain().focus().setDetails('Details').run(),
        },
        {
          title: 'Table of Contents',
          subtitle: 'Auto-generated from headings',
          action: (e) => e.chain().focus().setTableOfContents().run(),
        },
        {
          title: 'Video',
          subtitle: 'Embed a video',
          action: (e) => {
            const url = window.prompt('Enter video URL:');
            if (url) {
              return e.chain().focus().setVideo({ src: url }).run();
            }
            return false;
          },
        },
      ],
    } as SlashCommandOptions;
  },

  addProseMirrorPlugins() {
    return [
      Suggestion<
        SuggestionOptions & { command: (props: SuggestionOptions) => void } & {
          editor: Editor;
          range: Range;
        }
      >({
        editor: this.editor,
        char: '/',
        command: ({ editor, range, props }) => {
          // Replace the range with nothing then run command
          editor.chain().focus().deleteRange(range).run();
          (props as SlashCommandItem).action(editor);
        },
        items: ({ editor }: any) =>
          this.options.items(editor).map((item: any) => ({
            ...item,
            editor,
            command: (props: any) => {
              props.editor.chain().focus().deleteRange(props.range).run();
              item.action(props.editor);
            },
          })),
        render: renderItems,
      }),
    ];
  },
});
