/** Headless logic hook for Command */
import * as React from 'react';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  keywords?: string[];
  group?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onSelect?: () => void;
}

export interface UseCommandOptions {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  items?: CommandItem[];
  placeholder?: string;
  emptyMessage?: string;
  shouldFilter?: boolean;
  filter?: (value: string, search: string) => number;
}

export interface UseCommandReturn {
  isOpen: boolean;
  search: string;
  setSearch: (search: string) => void;
  filteredItems: CommandItem[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  selectItem: (item: CommandItem) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

// Simple fuzzy search function
function fuzzySearch(text: string, search: string): number {
  if (!search) return 1;

  const searchLower = search.toLowerCase();
  const textLower = text.toLowerCase();

  // Exact match gets highest score
  if (textLower.includes(searchLower)) {
    return 1;
  }

  // Fuzzy match
  let searchIndex = 0;
  let score = 0;

  for (
    let i = 0;
    i < textLower.length && searchIndex < searchLower.length;
    i++
  ) {
    if (textLower[i] === searchLower[searchIndex]) {
      score++;
      searchIndex++;
    }
  }

  return searchIndex === searchLower.length ? score / text.length : 0;
}

export function useCommand(options: UseCommandOptions = {}): UseCommandReturn {
  const {
    defaultOpen = false,
    open: controlledOpen,
    onOpenChange,
    items = [],
    shouldFilter = true,
    filter = fuzzySearch,
  } = options;

  const [internalOpen, setInternalOpen] = React.useState<boolean>(defaultOpen);
  const [search, setSearch] = React.useState<string>('');
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  const open = React.useCallback(() => setOpen(true), [setOpen]);
  const close = React.useCallback(() => {
    setOpen(false);
    setSearch('');
    setSelectedIndex(0);
  }, [setOpen]);
  const toggle = React.useCallback(() => setOpen(!isOpen), [setOpen, isOpen]);

  // Filter and sort items based on search
  const filteredItems = React.useMemo(() => {
    if (!shouldFilter || !search) {
      return items;
    }

    return items
      .map((item) => {
        const labelScore = filter(item.label, search);
        const descriptionScore = item.description
          ? filter(item.description, search)
          : 0;
        const keywordScore = item.keywords
          ? Math.max(...item.keywords.map((keyword) => filter(keyword, search)))
          : 0;

        const maxScore = Math.max(labelScore, descriptionScore, keywordScore);
        return { item, score: maxScore };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
  }, [items, search, shouldFilter, filter]);

  // Reset selected index when filtered items change
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  const selectItem = React.useCallback(
    (item: CommandItem) => {
      if (item.disabled) return;
      item.onSelect?.();
      close();
    },
    [close]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredItems.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredItems.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            selectItem(filteredItems[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          close();
          break;
      }
    },
    [filteredItems, selectedIndex, selectItem, close]
  );

  return {
    isOpen,
    search,
    setSearch,
    filteredItems,
    selectedIndex,
    setSelectedIndex,
    open,
    close,
    toggle,
    selectItem,
    handleKeyDown,
  };
}
