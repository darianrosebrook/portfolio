/**
 * Command (Composer)
 * A command palette component for search and command execution.
 * Supports fuzzy search, keyboard navigation, and grouping.
 */
'use client';
import * as React from 'react';
import { createPortal } from 'react-dom';
import styles from './Command.module.scss';
import {
  CommandProvider,
  CommandProviderProps,
  useCommandContext,
} from './CommandProvider';
import { CommandItem } from './useCommand';

// Search Icon component (replacing Lucide dependency)
const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

// Root Command Component
export interface CommandProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'children'>,
    CommandProviderProps {}

const CommandRoot: React.FC<CommandProps> = ({
  className = '',
  children,
  ...commandOptions
}) => {
  return (
    <CommandProvider {...commandOptions}>
      <div
        className={[styles.root, className].filter(Boolean).join(' ')}
        data-slot="command"
      >
        {children}
      </div>
    </CommandProvider>
  );
};

// Command Dialog Component (for modal usage)
export interface CommandDialogProps extends CommandProps {
  modal?: boolean;
}

const CommandDialog: React.FC<CommandDialogProps> = ({
  className = '',
  children,
  modal = true,
  ...commandOptions
}) => {
  const { isOpen, close } = useCommandContext();

  // Keyboard event handling for modal
  React.useEffect(() => {
    if (!isOpen || !modal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, modal, close]);

  // Body scroll lock for modal
  React.useEffect(() => {
    if (!modal || !isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [modal, isOpen]);

  // Focus management for modal command
  React.useEffect(() => {
    if (!isOpen || !modal) return;

    // Store previously focused element for return focus
    const previousFocusedElement = document.activeElement as HTMLElement;

    // Focus will be set to input by CommandInput component with autofocus

    return () => {
      // Return focus when command closes
      if (previousFocusedElement && document.contains(previousFocusedElement)) {
        previousFocusedElement.focus();
      }
    };
  }, [isOpen, modal]);

  if (!isOpen) return null;

  const content = (
    <CommandProvider {...commandOptions}>
      <div className={styles.overlay} onClick={modal ? close : undefined}>
        <div
          className={[styles.dialog, className].filter(Boolean).join(' ')}
          data-slot="command-dialog"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal={modal}
        >
          {children}
        </div>
      </div>
    </CommandProvider>
  );

  return modal && typeof document !== 'undefined'
    ? createPortal(content, document.body)
    : content;
};

// Command Input Component
export interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className = '', ...rest }, ref) => {
    const { search, setSearch, handleKeyDown, inputRef } = useCommandContext();

    const combinedRef = React.useCallback(
      (node: HTMLInputElement) => {
        if (inputRef) {
          inputRef.current = node;
        }
        if (ref) {
          if (typeof ref === 'function') {
            ref(node);
          } else {
            ref.current = node;
          }
        }
      },
      [inputRef, ref]
    );

    return (
      <div className={styles.inputWrapper}>
        <SearchIcon className={styles.searchIcon} aria-hidden="true" />
        <input
          ref={combinedRef}
          type="text"
          className={[styles.input, className].filter(Boolean).join(' ')}
          data-slot="command-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          {...rest}
        />
      </div>
    );
  }
);

// Command List Component
export interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {
  emptyMessage?: string;
}

const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
  (
    { className = '', children, emptyMessage = 'No results found.', ...rest },
    ref
  ) => {
    const { filteredItems, listRef } = useCommandContext();

    const combinedRef = React.useCallback(
      (node: HTMLDivElement) => {
        if (listRef) {
          listRef.current = node;
        }
        if (ref) {
          if (typeof ref === 'function') {
            ref(node);
          } else {
            ref.current = node;
          }
        }
      },
      [listRef, ref]
    );

    return (
      <div
        ref={combinedRef}
        className={[styles.list, className].filter(Boolean).join(' ')}
        data-slot="command-list"
        role="listbox"
        {...rest}
      >
        {filteredItems.length === 0 ? (
          <div className={styles.empty} role="option">
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </div>
    );
  }
);

// Command Group Component
export interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: string;
}

const CommandGroup: React.FC<CommandGroupProps> = ({
  className = '',
  children,
  heading,
  ...rest
}) => (
  <div
    className={[styles.group, className].filter(Boolean).join(' ')}
    data-slot="command-group"
    {...rest}
  >
    {heading && (
      <div className={styles.groupHeading} role="presentation">
        {heading}
      </div>
    )}
    <div className={styles.groupItems}>{children}</div>
  </div>
);

// Command Item Component
export interface CommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
  item: CommandItem;
  index: number;
}

const CommandItemComponent = React.forwardRef<HTMLDivElement, CommandItemProps>(
  ({ className = '', item, index, ...rest }, ref) => {
    const { selectedIndex, selectItem, setSelectedIndex } = useCommandContext();
    const isSelected = selectedIndex === index;

    const handleClick = () => {
      selectItem(item);
    };

    const handleMouseEnter = () => {
      setSelectedIndex(index);
    };

    return (
      <div
        ref={ref}
        className={[
          styles.item,
          isSelected ? styles.selected : '',
          item.disabled ? styles.disabled : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-slot="command-item"
        data-selected={isSelected}
        data-disabled={item.disabled}
        role="option"
        aria-selected={isSelected}
        aria-disabled={item.disabled}
        onClick={item.disabled ? undefined : handleClick}
        onMouseEnter={handleMouseEnter}
        {...rest}
      >
        {item.icon && <div className={styles.itemIcon}>{item.icon}</div>}
        <div className={styles.itemContent}>
          <div className={styles.itemLabel}>{item.label}</div>
          {item.description && (
            <div className={styles.itemDescription}>{item.description}</div>
          )}
        </div>
      </div>
    );
  }
);

// Command Items Component (renders filtered items)
export interface CommandItemsProps extends React.HTMLAttributes<HTMLDivElement> {}

const CommandItems: React.FC<CommandItemsProps> = ({
  className = '',
  ...rest
}) => {
  const { filteredItems } = useCommandContext();

  // Group items by group property
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};

    filteredItems.forEach((item) => {
      const groupName = item.group || 'Commands';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(item);
    });

    return groups;
  }, [filteredItems]);

  let itemIndex = 0;

  return (
    <div
      className={[styles.items, className].filter(Boolean).join(' ')}
      data-slot="command-items"
      {...rest}
    >
      {Object.entries(groupedItems).map(([groupName, items]) => (
        <CommandGroup key={groupName} heading={groupName}>
          {items.map((item) => (
            <CommandItemComponent
              key={item.id}
              item={item}
              index={itemIndex++}
            />
          ))}
        </CommandGroup>
      ))}
    </div>
  );
};

// Command Separator Component
export interface CommandSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

const CommandSeparator: React.FC<CommandSeparatorProps> = ({
  className = '',
  ...rest
}) => (
  <div
    className={[styles.separator, className].filter(Boolean).join(' ')}
    data-slot="command-separator"
    role="separator"
    {...rest}
  />
);

// Compound export
export const Command = Object.assign(CommandRoot, {
  Dialog: CommandDialog,
  Input: CommandInput,
  List: CommandList,
  Group: CommandGroup,
  Item: CommandItemComponent,
  Items: CommandItems,
  Separator: CommandSeparator,
});

// Set display names
CommandRoot.displayName = 'Command';
CommandDialog.displayName = 'Command.Dialog';
CommandInput.displayName = 'Command.Input';
CommandList.displayName = 'Command.List';
CommandGroup.displayName = 'Command.Group';
CommandItemComponent.displayName = 'Command.Item';
CommandItems.displayName = 'Command.Items';
CommandSeparator.displayName = 'Command.Separator';

export default Command;
