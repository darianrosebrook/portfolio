import { Editor, Extension, Range } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion from '@tiptap/suggestion';

type CommandAction = (editor: Editor) => boolean;

interface SlashCommandItem {
  title: string;
  subtitle?: string;
  keywords?: string[];
  action: CommandAction;
}

interface SlashCommandOptions {
  items: (editor: Editor) => SlashCommandItem[];
}

const slashCommandPluginKey = new PluginKey('slashCommand');

const POPUP_MIN_WIDTH = 280;
const POPUP_MAX_HEIGHT = 320;
const VIEWPORT_MARGIN = 8;

const filterItems = (
  items: SlashCommandItem[],
  query: string
): SlashCommandItem[] => {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => {
    if (item.title.toLowerCase().includes(q)) return true;
    if (item.subtitle?.toLowerCase().includes(q)) return true;
    return item.keywords?.some((kw) => kw.toLowerCase().includes(q)) ?? false;
  });
};

const positionPopup = (
  popup: HTMLElement,
  clientRect: (() => DOMRect | null) | null | undefined
) => {
  if (!clientRect) return;
  const rect = clientRect();
  if (!rect) return;

  const popupHeight = popup.offsetHeight || POPUP_MAX_HEIGHT;
  const popupWidth = popup.offsetWidth || POPUP_MIN_WIDTH;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let top = rect.bottom + 6;
  let left = rect.left;

  if (top + popupHeight > viewportHeight - VIEWPORT_MARGIN) {
    top = Math.max(VIEWPORT_MARGIN, rect.top - popupHeight - 6);
  }

  if (left + popupWidth > viewportWidth - VIEWPORT_MARGIN) {
    left = Math.max(
      VIEWPORT_MARGIN,
      viewportWidth - popupWidth - VIEWPORT_MARGIN
    );
  }
  if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;

  popup.style.top = `${top}px`;
  popup.style.left = `${left}px`;
};

interface RenderItem extends SlashCommandItem {
  command: (props: { editor: Editor; range: Range }) => void;
}

const renderItems = () => {
  let popup: HTMLDivElement | null = null;
  let listEl: HTMLDivElement | null = null;
  let items: RenderItem[] = [];
  let selectedIndex = 0;
  let currentProps: {
    editor: Editor;
    range: Range;
    clientRect?: (() => DOMRect | null) | null;
  } | null = null;

  const applySelection = () => {
    if (!listEl) return;
    const buttons = listEl.querySelectorAll<HTMLButtonElement>(
      'button[role="option"]'
    );
    buttons.forEach((btn, idx) => {
      const isSelected = idx === selectedIndex;
      btn.setAttribute('aria-selected', String(isSelected));
      btn.style.background = isSelected
        ? 'var(--semantic-color-background-accent)'
        : 'transparent';
      btn.style.color = isSelected
        ? 'var(--semantic-color-foreground-accent)'
        : 'var(--semantic-color-foreground-primary)';
    });
    const selected = buttons[selectedIndex];
    if (selected) selected.scrollIntoView({ block: 'nearest' });
  };

  const runSelected = () => {
    if (!currentProps) return;
    const item = items[selectedIndex];
    if (!item) return;
    item.command({ editor: currentProps.editor, range: currentProps.range });
  };

  const renderList = () => {
    if (!popup) return;
    popup.innerHTML = '';

    const list = document.createElement('div');
    list.setAttribute('role', 'listbox');
    Object.assign(list.style, {
      maxHeight: `${POPUP_MAX_HEIGHT}px`,
      overflowY: 'auto',
      padding: '4px',
    } as CSSStyleDeclaration);

    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.textContent = 'No matches';
      empty.style.cssText =
        'padding: 12px; text-align: center; color: var(--semantic-color-foreground-secondary); font-size: 14px;';
      list.appendChild(empty);
      popup.appendChild(list);
      listEl = list;
      return;
    }

    items.forEach((item, index) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'slash-item';
      el.setAttribute('role', 'option');
      el.setAttribute('aria-selected', String(index === selectedIndex));

      Object.assign(el.style, {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '2px',
        width: '100%',
        textAlign: 'left',
        padding: '8px 10px',
        borderRadius: 'var(--core-shape-radius-small)',
        border: 'none',
        background:
          index === selectedIndex
            ? 'var(--semantic-color-background-accent)'
            : 'transparent',
        color:
          index === selectedIndex
            ? 'var(--semantic-color-foreground-accent)'
            : 'var(--semantic-color-foreground-primary)',
        cursor: 'pointer',
      } as CSSStyleDeclaration);

      const title = document.createElement('div');
      title.textContent = item.title;
      title.style.cssText =
        'font-weight: 600; font-size: 14px; line-height: 1.4;';
      el.appendChild(title);

      if (item.subtitle) {
        const subtitle = document.createElement('div');
        subtitle.textContent = item.subtitle;
        subtitle.style.cssText =
          'font-size: 12px; line-height: 1.3; opacity: 0.8;';
        el.appendChild(subtitle);
      }

      el.addEventListener('mouseenter', () => {
        if (selectedIndex === index) return;
        selectedIndex = index;
        applySelection();
      });

      el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        selectedIndex = index;
        runSelected();
      });

      list.appendChild(el);
    });

    popup.appendChild(list);
    listEl = list;
  };

  return {
    onStart: (props: any) => {
      popup = document.createElement('div');
      popup.className = 'slash-command';
      popup.setAttribute('role', 'menu');
      Object.assign(popup.style, {
        position: 'fixed',
        zIndex: '1000',
        background: 'var(--semantic-color-background-primary)',
        border: '1px solid var(--semantic-color-border-primary)',
        borderRadius: 'var(--core-shape-radius-medium)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        minWidth: `${POPUP_MIN_WIDTH}px`,
        maxWidth: '360px',
        top: '0px',
        left: '0px',
      } as CSSStyleDeclaration);

      document.body.appendChild(popup);

      items = (props.items ?? []) as RenderItem[];
      selectedIndex = 0;
      currentProps = {
        editor: props.editor,
        range: props.range,
        clientRect: props.clientRect,
      };

      renderList();
      positionPopup(popup, props.clientRect);
    },

    onUpdate: (props: any) => {
      if (!popup) return;
      items = (props.items ?? []) as RenderItem[];
      selectedIndex = Math.max(0, Math.min(selectedIndex, items.length - 1));
      currentProps = {
        editor: props.editor,
        range: props.range,
        clientRect: props.clientRect,
      };
      renderList();
      positionPopup(popup, props.clientRect);
    },

    onKeyDown: (props: { event: KeyboardEvent }) => {
      const key = props.event.key;

      if (key === 'Escape') return true;

      if (key === 'ArrowDown') {
        props.event.preventDefault();
        if (items.length === 0) return true;
        selectedIndex = (selectedIndex + 1) % items.length;
        applySelection();
        return true;
      }

      if (key === 'ArrowUp') {
        props.event.preventDefault();
        if (items.length === 0) return true;
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        applySelection();
        return true;
      }

      if (key === 'Enter' || key === 'Tab') {
        props.event.preventDefault();
        runSelected();
        return true;
      }

      return false;
    },

    onExit: () => {
      if (popup) {
        popup.remove();
        popup = null;
      }
      listEl = null;
      items = [];
      selectedIndex = 0;
      currentProps = null;
    },
  };
};

const defaultItems = (): SlashCommandItem[] => [
  {
    title: 'Heading 1',
    subtitle: 'Large section title',
    keywords: ['h1', 'title', 'heading'],
    action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: 'Heading 2',
    subtitle: 'Section title',
    keywords: ['h2', 'subtitle', 'heading'],
    action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: 'Heading 3',
    subtitle: 'Subsection title',
    keywords: ['h3', 'heading'],
    action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: 'Bullet List',
    subtitle: 'Create a bulleted list',
    keywords: ['ul', 'list', 'unordered'],
    action: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    title: 'Ordered List',
    subtitle: 'Create a numbered list',
    keywords: ['ol', 'list', 'ordered', 'numbered'],
    action: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    title: 'Task List',
    subtitle: 'Create a checklist',
    keywords: ['todo', 'checklist', 'task'],
    action: (e) => e.chain().focus().toggleTaskList().run(),
  },
  {
    title: 'Quote',
    subtitle: 'Insert a blockquote',
    keywords: ['blockquote', 'quote'],
    action: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    title: 'Code Block',
    subtitle: 'Insert code block',
    keywords: ['code', 'pre', 'snippet'],
    action: (e) => e.chain().focus().toggleCodeBlock().run(),
  },
  {
    title: 'Horizontal Rule',
    subtitle: 'Insert a divider',
    keywords: ['hr', 'divider', 'rule', 'separator'],
    action: (e) => e.chain().focus().setHorizontalRule().run(),
  },
  {
    title: 'Details',
    subtitle: 'Collapsible section',
    keywords: ['toggle', 'collapse', 'accordion'],
    action: (e) => e.chain().focus().setDetails('Details').run(),
  },
  {
    title: 'Table of Contents',
    subtitle: 'Auto-generated from headings',
    keywords: ['toc', 'contents', 'outline'],
    action: (e) => e.chain().focus().setTableOfContents().run(),
  },
  {
    title: 'Video',
    subtitle: 'Embed a video',
    keywords: ['video', 'embed', 'media'],
    action: (e) => {
      const url = window.prompt('Enter video URL:');
      if (!url) return false;
      return e.chain().focus().setVideo({ src: url }).run();
    },
  },
];

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: 'slashCommand',

  addOptions() {
    return {
      items: () => defaultItems(),
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion<RenderItem>({
        editor: this.editor,
        pluginKey: slashCommandPluginKey,
        char: '/',
        startOfLine: false,
        allowSpaces: false,
        // Suggestion fires this when an item is picked. The selected item
        // already carries its own `.command` (set in `items` below) which
        // does deleteRange + action — just delegate to it. Keeping the
        // commit logic on the item means the renderer (which calls
        // `item.command` on mousedown/Enter) and Suggestion's own pick
        // path go through the same code.
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
        items: ({ query, editor }) => {
          const all = this.options.items(editor);
          const filtered = filterItems(all, query);
          return filtered.map<RenderItem>((item) => ({
            ...item,
            command: ({ editor: e, range }) => {
              e.chain().focus().deleteRange(range).run();
              item.action(e);
            },
          }));
        },
        render: renderItems,
      }),
    ];
  },
});

export { defaultItems, filterItems };
export type { SlashCommandItem, SlashCommandOptions };
