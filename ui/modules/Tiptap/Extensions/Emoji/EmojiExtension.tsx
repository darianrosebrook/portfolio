import { Extension, Range } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';

// Static PluginKey instance to ensure uniqueness across extension instances
const emojiPluginKey = new PluginKey('emoji');

// Common emoji list (can be expanded)
const EMOJI_LIST = [
  { emoji: '😀', shortcode: 'grinning' },
  { emoji: '😃', shortcode: 'smiley' },
  { emoji: '😄', shortcode: 'smile' },
  { emoji: '😁', shortcode: 'grin' },
  { emoji: '😆', shortcode: 'laughing' },
  { emoji: '😅', shortcode: 'sweat_smile' },
  { emoji: '🤣', shortcode: 'rofl' },
  { emoji: '😂', shortcode: 'joy' },
  { emoji: '🙂', shortcode: 'slightly_smiling' },
  { emoji: '🙃', shortcode: 'upside_down' },
  { emoji: '😉', shortcode: 'wink' },
  { emoji: '😊', shortcode: 'blush' },
  { emoji: '😇', shortcode: 'innocent' },
  { emoji: '🥰', shortcode: 'smiling_heart' },
  { emoji: '😍', shortcode: 'heart_eyes' },
  { emoji: '🤩', shortcode: 'star_struck' },
  { emoji: '😘', shortcode: 'kissing' },
  { emoji: '😗', shortcode: 'kissing_smiling' },
  { emoji: '😚', shortcode: 'kissing_closed' },
  { emoji: '😙', shortcode: 'kissing_heart' },
  { emoji: '😋', shortcode: 'yum' },
  { emoji: '😛', shortcode: 'stuck_out_tongue' },
  { emoji: '😜', shortcode: 'stuck_out_tongue_wink' },
  { emoji: '🤪', shortcode: 'zany' },
  { emoji: '😝', shortcode: 'stuck_out_tongue_closed' },
  { emoji: '🤑', shortcode: 'money_mouth' },
  { emoji: '🤗', shortcode: 'hugs' },
  { emoji: '🤭', shortcode: 'hand_over_mouth' },
  { emoji: '🤫', shortcode: 'shushing' },
  { emoji: '🤔', shortcode: 'thinking' },
  { emoji: '🤐', shortcode: 'zipper_mouth' },
  { emoji: '🤨', shortcode: 'raised_eyebrow' },
  { emoji: '😐', shortcode: 'neutral' },
  { emoji: '😑', shortcode: 'expressionless' },
  { emoji: '😶', shortcode: 'no_mouth' },
  { emoji: '😏', shortcode: 'smirk' },
  { emoji: '😒', shortcode: 'unamused' },
  { emoji: '🙄', shortcode: 'roll_eyes' },
  { emoji: '😬', shortcode: 'grimacing' },
  { emoji: '🤥', shortcode: 'lying' },
  { emoji: '😌', shortcode: 'relieved' },
  { emoji: '😔', shortcode: 'pensive' },
  { emoji: '😪', shortcode: 'sleepy' },
  { emoji: '🤤', shortcode: 'drooling' },
  { emoji: '😴', shortcode: 'sleeping' },
  { emoji: '😷', shortcode: 'mask' },
  { emoji: '🤒', shortcode: 'thermometer_face' },
  { emoji: '🤕', shortcode: 'head_bandage' },
  { emoji: '🤢', shortcode: 'nauseated' },
  { emoji: '🤮', shortcode: 'vomiting' },
  { emoji: '🤧', shortcode: 'sneezing' },
  { emoji: '🥵', shortcode: 'hot' },
  { emoji: '🥶', shortcode: 'cold' },
  { emoji: '😵', shortcode: 'dizzy' },
  { emoji: '🤯', shortcode: 'exploding_head' },
  { emoji: '🤠', shortcode: 'cowboy' },
  { emoji: '🥳', shortcode: 'partying' },
  { emoji: '😎', shortcode: 'sunglasses' },
  { emoji: '🤓', shortcode: 'nerd' },
  { emoji: '🧐', shortcode: 'monocle' },
  { emoji: '👍', shortcode: 'thumbsup' },
  { emoji: '👎', shortcode: 'thumbsdown' },
  { emoji: '👏', shortcode: 'clap' },
  { emoji: '🙌', shortcode: 'raised_hands' },
  { emoji: '👌', shortcode: 'ok_hand' },
  { emoji: '🤝', shortcode: 'handshake' },
  { emoji: '✌️', shortcode: 'peace' },
  { emoji: '🤞', shortcode: 'crossed_fingers' },
  { emoji: '💪', shortcode: 'muscle' },
  { emoji: '🙏', shortcode: 'pray' },
  { emoji: '✅', shortcode: 'white_check_mark' },
  { emoji: '❌', shortcode: 'x' },
  { emoji: '⭐', shortcode: 'star' },
  { emoji: '🔥', shortcode: 'fire' },
  { emoji: '💯', shortcode: 'hundred' },
  { emoji: '💡', shortcode: 'bulb' },
  { emoji: '🎉', shortcode: 'tada' },
  { emoji: '🚀', shortcode: 'rocket' },
  { emoji: '💻', shortcode: 'computer' },
  { emoji: '📝', shortcode: 'memo' },
  { emoji: '📌', shortcode: 'pushpin' },
  { emoji: '🔗', shortcode: 'link' },
  { emoji: '📎', shortcode: 'paperclip' },
  { emoji: '📊', shortcode: 'chart' },
  { emoji: '🎨', shortcode: 'art' },
  { emoji: '🎯', shortcode: 'target' },
  { emoji: '⚡', shortcode: 'zap' },
  { emoji: '🎊', shortcode: 'confetti' },
  { emoji: '✨', shortcode: 'sparkles' },
];

interface EmojiItem {
  emoji: string;
  shortcode: string;
}

const renderEmojiItems = () => {
  let component: HTMLDivElement | null = null;
  let selectedIndex = 0;
  let items: EmojiItem[] = [];
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
      component.className = 'emoji-suggestion';
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
        maxHeight: '320px',
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
      list.style.maxHeight = '280px';
      list.style.overflowY = 'auto';
      list.style.padding = '4px';
      list.style.scrollBehavior = 'smooth';
      list.style.display = 'grid';
      list.style.gridTemplateColumns = 'repeat(8, 1fr)';
      list.style.gap = '2px';

      items.forEach((item: EmojiItem, index: number) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'emoji-item';
        el.setAttribute('role', 'option');
        el.setAttribute('aria-label', `Insert ${item.shortcode} emoji`);
        el.setAttribute('aria-selected', (index === selectedIndex).toString());
        const isSelected = index === selectedIndex;

        Object.assign(el.style, {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: 'var(--core-shape-radius-small)',
          border: 'none',
          background: isSelected
            ? 'var(--semantic-color-background-accent)'
            : 'transparent',
          cursor: 'pointer',
          fontSize: '20px',
          transition: 'all 0.15s ease',
        } as CSSStyleDeclaration);

        el.textContent = item.emoji;

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
        selectedIndex = Math.min(selectedIndex + 8, items.length - 1);
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
          });
        }
        scrollIntoView(selectedIndex);
        return true;
      }

      if (key === 'ArrowUp') {
        props.event.preventDefault();
        selectedIndex = Math.max(selectedIndex - 8, 0);
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
          });
        }
        scrollIntoView(selectedIndex);
        return true;
      }

      if (key === 'ArrowRight') {
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
          });
        }
        scrollIntoView(selectedIndex);
        return true;
      }

      if (key === 'ArrowLeft') {
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

export const EmojiExtension = Extension.create({
  name: 'emoji',

  addProseMirrorPlugins() {
    return [
      Suggestion<
        SuggestionOptions & {
          command: (props: { editor: any; range: Range }) => void;
        }
      >({
        editor: this.editor,
        pluginKey: emojiPluginKey,
        char: ':',
        command: ({ editor, range, props }) => {
          editor.chain().focus().deleteRange(range).run();
          const emoji = (props as EmojiItem).emoji;
          editor.chain().insertContent(emoji).run();
        },
        items: ({ query, editor }: { query: string; editor: any }) => {
          if (!query) {
            return EMOJI_LIST.slice(0, 24).map((item) => ({
              ...item,
              editor,
              command: ({
                editor: editorInstance,
                range,
              }: {
                editor: any;
                range: Range;
              }) => {
                editorInstance.chain().focus().deleteRange(range).run();
                editorInstance.chain().insertContent(item.emoji).run();
              },
            }));
          }

          const queryLower = query.toLowerCase();
          const filtered = EMOJI_LIST.filter((item) =>
            item.shortcode.toLowerCase().includes(queryLower)
          );

          return filtered.slice(0, 48).map((item) => ({
            ...item,
            editor,
            command: ({
              editor: editorInstance,
              range,
            }: {
              editor: any;
              range: Range;
            }) => {
              editorInstance.chain().focus().deleteRange(range).run();
              editorInstance.chain().insertContent(item.emoji).run();
            },
          }));
        },
        render: renderEmojiItems,
      }),
    ];
  },
});
