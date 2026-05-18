'use client';
import * as React from 'react';
import './Truncate.css';

export interface TruncateProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onToggle'
> {
  /** Element type to render */
  as?: keyof React.JSX.IntrinsicElements;
  /** Number of lines to show before truncating */
  lines?: number;
  /** Whether to show expand/collapse functionality */
  expandable?: boolean;
  /** Custom expand text */
  expandText?: string;
  /** Custom collapse text */
  collapseText?: string;
  /** Callback when expand/collapse state changes */
  onToggle?: (
    expanded: boolean,
    event: React.MouseEvent<HTMLButtonElement>
  ) => void;
}

export const Truncate = React.forwardRef<HTMLElement, TruncateProps>(
  (
    {
      as: Component = 'div',
      lines = 1,
      expandable = false,
      expandText = 'Show more',
      collapseText = 'Show less',
      onToggle,
      className = '',
      children,
      style,
      ...rest
    },
    ref
  ) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [shouldShowToggle, setShouldShowToggle] = React.useState(false);
    const contentRef = React.useRef<HTMLElement | null>(null);

    React.useEffect(() => {
      if (!expandable || !contentRef.current) return;

      const element = contentRef.current;
      const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
      const maxHeight = lineHeight * lines;

      setShouldShowToggle(element.scrollHeight > maxHeight);
    }, [children, lines, expandable]);

    const handleToggle = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        const newExpanded = !isExpanded;
        setIsExpanded(newExpanded);
        onToggle?.(newExpanded, event);
      },
      [isExpanded, onToggle]
    );

    const customStyle: React.CSSProperties = {
      ...style,
      ['--ds-truncate-lines' as any]: lines,
    };

    return React.createElement(
      Component,
      {
        'data-ds-component': 'Truncate',
        'data-slot': 'truncate',
        ref: (node: HTMLElement | null) => {
          (contentRef as React.MutableRefObject<HTMLElement | null>).current =
            node;
          if (typeof ref === 'function') ref(node);
          else if (ref && 'current' in (ref as any)) {
            (ref as React.MutableRefObject<HTMLElement | null>).current = node;
          }
        },
        className: [
          'truncate',
          isExpanded ? 'expanded' : '',
          expandable && shouldShowToggle ? 'expandable' : '',
          className,
        ]
          .filter(Boolean)
          .join(' '),
        style: customStyle,
        ...rest,
      },
      <>
        <span data-slot="truncate-content" className="content">
          {children}
        </span>
        {expandable && shouldShowToggle && (
          <button
            data-slot="truncate-toggle"
            type="button"
            className="toggle"
            onClick={handleToggle}
            aria-expanded={isExpanded}
          >
            {isExpanded ? collapseText : expandText}
          </button>
        )}
      </>
    );
  }
);

Truncate.displayName = 'Truncate';
export default Truncate;
