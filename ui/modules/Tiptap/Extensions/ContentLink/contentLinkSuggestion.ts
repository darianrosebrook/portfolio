/**
 * Suggestion plumbing for the contentLink node: async search against
 * /api/search-content and a keyboard-navigable popup, built as plain DOM in
 * the same style as the SlashCommand renderer.
 */

import type { Editor, Range } from '@tiptap/core';
import type { ContentSearchResult } from '@/utils/supabase/contentRelations';

export interface ContentLinkSuggestionItem extends ContentSearchResult {
  command: (props: { editor: Editor; range: Range }) => void;
}

export async function fetchContentSuggestions(
  query: string
): Promise<ContentSearchResult[]> {
  if (query.trim().length < 2) return [];
  try {
    const response = await fetch(
      `/api/search-content?q=${encodeURIComponent(query)}&limit=6`
    );
    if (!response.ok) return [];
    const { data } = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Content suggestion fetch failed:', error);
    return [];
  }
}

const POPUP_MIN_WIDTH = 300;
const POPUP_MAX_HEIGHT = 320;
const VIEWPORT_MARGIN = 8;

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

export const renderContentLinkSuggestions = () => {
  let popup: HTMLDivElement | null = null;
  let items: ContentLinkSuggestionItem[] = [];
  let selectedIndex = 0;
  let currentProps: {
    editor: Editor;
    range: Range;
    clientRect?: (() => DOMRect | null) | null;
  } | null = null;

  const applySelection = (list: HTMLElement) => {
    const buttons = list.querySelectorAll<HTMLButtonElement>(
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
    list.setAttribute('aria-label', 'Content suggestions');
    Object.assign(list.style, {
      maxHeight: `${POPUP_MAX_HEIGHT}px`,
      overflowY: 'auto',
      padding: '4px',
    } as CSSStyleDeclaration);

    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.textContent = 'No matching content';
      Object.assign(empty.style, {
        padding: '12px',
        textAlign: 'center',
        color: 'var(--semantic-color-foreground-secondary)',
        fontSize: '14px',
      } as CSSStyleDeclaration);
      list.appendChild(empty);
      popup.appendChild(list);
      return;
    }

    items.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', String(index === selectedIndex));
      Object.assign(button.style, {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        width: '100%',
        textAlign: 'left',
        padding: '8px 12px',
        border: 'none',
        borderRadius: 'var(--core-shape-radius-small)',
        background: 'transparent',
        color: 'var(--semantic-color-foreground-primary)',
        cursor: 'pointer',
      } as CSSStyleDeclaration);

      const titleRow = document.createElement('span');
      Object.assign(titleRow.style, {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        fontWeight: '600',
        fontSize: '14px',
      } as CSSStyleDeclaration);

      const titleText = document.createElement('span');
      titleText.textContent = item.title;
      titleRow.appendChild(titleText);

      const badge = document.createElement('span');
      badge.textContent = item.type === 'article' ? 'Article' : 'Case study';
      Object.assign(badge.style, {
        padding: '1px 8px',
        borderRadius: 'var(--core-shape-radius-full)',
        background: 'var(--semantic-color-background-secondary)',
        color: 'var(--semantic-color-foreground-secondary)',
        fontSize: '11px',
        fontWeight: '500',
      } as CSSStyleDeclaration);
      titleRow.appendChild(badge);

      if (item.status && item.status !== 'published') {
        const draft = document.createElement('span');
        draft.textContent = 'Draft';
        Object.assign(draft.style, {
          padding: '1px 8px',
          borderRadius: 'var(--core-shape-radius-full)',
          background: 'var(--semantic-color-background-warning-subtle)',
          color: 'var(--semantic-color-foreground-warning)',
          fontSize: '11px',
          fontWeight: '500',
        } as CSSStyleDeclaration);
        titleRow.appendChild(draft);
      }

      button.appendChild(titleRow);

      if (item.description) {
        const snippet = document.createElement('span');
        snippet.textContent =
          item.description.length > 80
            ? `${item.description.slice(0, 80)}…`
            : item.description;
        Object.assign(snippet.style, {
          color: 'var(--semantic-color-foreground-secondary)',
          fontSize: '12px',
        } as CSSStyleDeclaration);
        button.appendChild(snippet);
      }

      button.addEventListener('mouseenter', () => {
        selectedIndex = index;
        applySelection(list);
      });
      button.addEventListener('mousedown', (event) => {
        event.preventDefault();
        selectedIndex = index;
        runSelected();
      });

      list.appendChild(button);
    });

    popup.appendChild(list);
    applySelection(list);
  };

  return {
    onStart: (props: {
      editor: Editor;
      range: Range;
      clientRect?: (() => DOMRect | null) | null;
    }) => {
      popup = document.createElement('div');
      popup.setAttribute('role', 'menu');
      popup.className = 'content-link-suggestion';
      Object.assign(popup.style, {
        position: 'absolute',
        zIndex: '1000',
        minWidth: `${POPUP_MIN_WIDTH}px`,
        maxWidth: '380px',
        background: 'var(--semantic-color-background-primary)',
        border: '1px solid var(--semantic-color-border-primary)',
        borderRadius: 'var(--core-shape-radius-medium)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
      } as CSSStyleDeclaration);
      document.body.appendChild(popup);

      currentProps = props;
      items = [];
      selectedIndex = 0;
      positionPopup(popup, props.clientRect);
      renderList();
    },

    onUpdate: (props: {
      editor: Editor;
      range: Range;
      items: ContentLinkSuggestionItem[];
      clientRect?: (() => DOMRect | null) | null;
    }) => {
      currentProps = props;
      items = props.items || [];
      selectedIndex = Math.max(0, Math.min(selectedIndex, items.length - 1));
      if (popup) positionPopup(popup, props.clientRect);
      renderList();
    },

    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (!popup) return false;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        selectedIndex = items.length ? (selectedIndex + 1) % items.length : 0;
        const list = popup.querySelector('[role="listbox"]');
        if (list) applySelection(list as HTMLElement);
        return true;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        selectedIndex = items.length
          ? (selectedIndex - 1 + items.length) % items.length
          : 0;
        const list = popup.querySelector('[role="listbox"]');
        if (list) applySelection(list as HTMLElement);
        return true;
      }

      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        runSelected();
        return true;
      }

      if (event.key === 'Escape') {
        popup.remove();
        popup = null;
        return true;
      }

      return false;
    },

    onExit: () => {
      if (popup) {
        popup.remove();
        popup = null;
      }
      items = [];
      selectedIndex = 0;
      currentProps = null;
    },
  };
};
