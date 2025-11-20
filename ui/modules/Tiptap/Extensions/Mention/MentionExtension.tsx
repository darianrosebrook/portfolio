import { Editor, Extension, Range } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';

// Static PluginKey instance to ensure uniqueness across extension instances
const mentionPluginKey = new PluginKey('mention');

interface MentionItem {
  id: string;
  label: string;
  avatar?: string;
}

interface MentionOptions {
  fetchUsers?: (query: string) => Promise<MentionItem[]>;
}

const renderMentionItems = () => {
  let component: HTMLDivElement | null = null;
  let selectedIndex = 0;
  let items: MentionItem[] = [];
  let currentProps: any = null;

  const scrollIntoView = (index: number) => {
    if (!component) return;
    const list = component.querySelector('div[role="listbox"]') as HTMLElement;
    if (!list) return;

    const items = list.querySelectorAll('button[role="option"]');
    const selectedItem = items[index] as HTMLElement;
    if (selectedItem) {
      selectedItem.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  };

  return {
    onStart: (props: any) => {
      component = document.createElement('div');
      component.className = 'mention-suggestion';
      component.setAttribute('role', 'menu');
      Object.assign(component.style, {
        position: 'absolute',
        zIndex: '1000',
        background: 'var(--semantic-color-background-primary)',
        border: '1px solid var(--semantic-color-border-primary)',
        borderRadius: 'var(--core-shape-radius-medium)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        minWidth: '280px',
        maxWidth: '320px',
      });

      document.body.appendChild(component);
      selectedIndex = 0;
      currentProps = props;
    },
    onUpdate: (props: any) => {
      if (!component) return;

      currentProps = props;
      items = props.items || [];
      selectedIndex = Math.max(0, Math.min(selectedIndex, items.length - 1));

      component.innerHTML = '';

      const list = document.createElement('div');
      list.setAttribute('role', 'listbox');
      list.style.maxHeight = '320px';
      list.style.overflowY = 'auto';
      list.style.padding = '4px';
      list.style.scrollBehavior = 'smooth';

      if (items.length === 0) {
        const empty = document.createElement('div');
        empty.textContent = 'No users found';
        empty.style.cssText = `
          padding: 12px;
          text-align: center;
          color: var(--semantic-color-foreground-secondary);
          font-size: 14px;
        `;
        list.appendChild(empty);
      }

      items.forEach((item: MentionItem, index: number) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'mention-item';
        el.setAttribute('role', 'option');
        el.setAttribute('aria-selected', (index === selectedIndex).toString());
        const isSelected = index === selectedIndex;

        Object.assign(el.style, {
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          width: '100%',
          textAlign: 'left',
          padding: '8px 12px',
          borderRadius: 'var(--core-shape-radius-small)',
          border: 'none',
          background: isSelected
            ? 'var(--semantic-color-background-accent)'
            : 'transparent',
          color: isSelected
            ? 'var(--semantic-color-foreground-accent)'
            : 'var(--semantic-color-foreground-primary)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        } as CSSStyleDeclaration);

        // Avatar
        const avatar = document.createElement('div');
        if (item.avatar) {
          avatar.innerHTML = `<img src="${item.avatar}" alt="${item.label}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" />`;
        } else {
          avatar.innerHTML = `<div style="width: 24px; height: 24px; border-radius: 50%; background: var(--semantic-color-background-accent); display: flex; align-items: center; justify-content: center; color: var(--semantic-color-foreground-accent); font-size: 12px; font-weight: 600;">${item.label.charAt(0).toUpperCase()}</div>`;
        }
        avatar.style.cssText = 'flex-shrink: 0;';

        const label = document.createElement('div');
        label.textContent = item.label;
        label.style.cssText = `
          font-weight: 600;
          font-size: 14px;
          line-height: 1.4;
        `;

        el.addEventListener('mouseenter', () => {
          selectedIndex = index;
          items.forEach((_, idx) => {
            const itemEl = list.querySelector(
              `button[role="option"]:nth-child(${idx + 1})`
            ) as HTMLElement;
            if (itemEl) {
              const isSelected = idx === selectedIndex;
              itemEl.setAttribute('aria-selected', isSelected.toString());
              itemEl.style.background = isSelected
                ? 'var(--semantic-color-background-accent)'
                : 'transparent';
              itemEl.style.color = isSelected
                ? 'var(--semantic-color-foreground-accent)'
                : 'var(--semantic-color-foreground-primary)';
            }
          });
        });

        el.addEventListener('mousedown', (e) => {
          e.preventDefault();
          const itemWithCommand = item as any;
          if (itemWithCommand.command) {
            itemWithCommand.command({
              editor: props.editor,
              range: props.range,
            });
          }
        });

        el.appendChild(avatar);
        el.appendChild(label);
        list.appendChild(el);
      });

      component.appendChild(list);

      scrollIntoView(selectedIndex);
    },
    onKeyDown: (props: { event: KeyboardEvent }) => {
      if (!component || !currentProps) return false;

      const key = props.event.key;

      if (key === 'Escape') {
        return true;
      }

      if (key === 'ArrowDown') {
        props.event.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        const list = component.querySelector('div[role="listbox"]');
        if (list) {
          const buttons = list.querySelectorAll('button[role="option"]');
          buttons.forEach((btn, idx) => {
            const isSelected = idx === selectedIndex;
            (btn as HTMLElement).setAttribute(
              'aria-selected',
              isSelected.toString()
            );
            (btn as HTMLElement).style.background = isSelected
              ? 'var(--semantic-color-background-accent)'
              : 'transparent';
            (btn as HTMLElement).style.color = isSelected
              ? 'var(--semantic-color-foreground-accent)'
              : 'var(--semantic-color-foreground-primary)';
          });
        }
        scrollIntoView(selectedIndex);
        return true;
      }

      if (key === 'ArrowUp') {
        props.event.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        const list = component.querySelector('div[role="listbox"]');
        if (list) {
          const buttons = list.querySelectorAll('button[role="option"]');
          buttons.forEach((btn, idx) => {
            const isSelected = idx === selectedIndex;
            (btn as HTMLElement).setAttribute(
              'aria-selected',
              isSelected.toString()
            );
            (btn as HTMLElement).style.background = isSelected
              ? 'var(--semantic-color-background-accent)'
              : 'transparent';
            (btn as HTMLElement).style.color = isSelected
              ? 'var(--semantic-color-foreground-accent)'
              : 'var(--semantic-color-foreground-primary)';
          });
        }
        scrollIntoView(selectedIndex);
        return true;
      }

      if (key === 'Enter' || key === 'Tab') {
        props.event.preventDefault();
        const selectedItem = items[selectedIndex];
        if (selectedItem) {
          const itemWithCommand = selectedItem as any;
          if (itemWithCommand.command) {
            itemWithCommand.command({
              editor: currentProps.editor,
              range: currentProps.range,
            });
          }
        }
        return true;
      }

      return false;
    },
    onExit: () => {
      if (component) {
        component.remove();
        component = null;
      }
      selectedIndex = 0;
      items = [];
      currentProps = null;
    },
  };
};

export const MentionExtension = Extension.create<MentionOptions>({
  name: 'mention',

  addOptions() {
    return {
      fetchUsers: async (query: string) => {
        // Default implementation - fetch from Supabase
        try {
          const response = await fetch(
            `/api/users/search?q=${encodeURIComponent(query)}`
          );
          if (response.ok) {
            const data = await response.json();
            return data.users || [];
          }
        } catch (error) {
          console.error('Failed to fetch users:', error);
        }
        return [];
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion<
        SuggestionOptions & {
          command: (props: { editor: Editor; range: Range }) => void;
        }
      >({
        editor: this.editor,
        pluginKey: mentionPluginKey,
        char: '@',
        command: ({ editor, range, props }) => {
          editor.chain().focus().deleteRange(range).run();
          const mention = props as MentionItem;
          editor.chain().insertContent(`@${mention.label}`).run();
        },
        items: async ({ query, editor }: { query: string; editor: Editor }) => {
          if (!this.options.fetchUsers) {
            return [];
          }
          const users = await this.options.fetchUsers(query);
          return users.map((user: MentionItem) => ({
            ...user,
            editor,
            command: ({
              editor: editorInstance,
              range,
            }: {
              editor: Editor;
              range: Range;
            }) => {
              editorInstance.chain().focus().deleteRange(range).run();
              editorInstance.chain().insertContent(`@${user.label}`).run();
            },
          }));
        },
        render: renderMentionItems,
      }),
    ];
  },
});
