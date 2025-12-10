/**
 * Accordion (Composer)
 * A collapsible content component that supports single or multiple open items.
 */
'use client';
import * as React from 'react';
import styles from './Accordion.module.scss';
import {
  AccordionProvider,
  AccordionProviderProps,
  useAccordionContext,
} from './AccordionProvider';

// Chevron Down Icon component (replacing Lucide dependency)
const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="m6 9 6 6 6-6" />
  </svg>
);

// Root Accordion Component
export interface AccordionProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'children'>,
    AccordionProviderProps {}

const AccordionRoot: React.FC<AccordionProps> = ({
  className = '',
  children,
  type,
  defaultValue,
  value,
  onValueChange,
  collapsible,
  ...rest
}) => {
  return (
    <AccordionProvider
      type={type}
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      collapsible={collapsible}
    >
      <div
        className={[styles.accordion, className].filter(Boolean).join(' ')}
        data-slot="accordion"
        {...rest}
      >
        {children}
      </div>
    </AccordionProvider>
  );
};

// Accordion Item Component
export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  className = '',
  children,
  value,
  ...rest
}) => {
  const { isItemOpen } = useAccordionContext();
  const isOpen = isItemOpen(value);

  return (
    <div
      className={[styles.item, className].filter(Boolean).join(' ')}
      data-slot="accordion-item"
      data-state={isOpen ? 'open' : 'closed'}
      {...rest}
    >
      {children}
    </div>
  );
};

// Accordion Trigger Component
export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  className = '',
  children,
  value,
  ...rest
}) => {
  const { isItemOpen, toggleItem } = useAccordionContext();
  const isOpen = isItemOpen(value);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    toggleItem(value);
    rest.onClick?.(event);
  };

  return (
    <div className={styles.header}>
      <button
        className={[styles.trigger, className].filter(Boolean).join(' ')}
        data-slot="accordion-trigger"
        data-state={isOpen ? 'open' : 'closed'}
        aria-expanded={isOpen}
        onClick={handleClick}
        {...rest}
      >
        {children}
        <ChevronDownIcon className={styles.chevron} aria-hidden="true" />
      </button>
    </div>
  );
};

// Accordion Content Component
export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const AccordionContent: React.FC<AccordionContentProps> = ({
  className = '',
  children,
  value,
  ...rest
}) => {
  const { isItemOpen } = useAccordionContext();
  const isOpen = isItemOpen(value);
  const contentRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      ref={contentRef}
      className={[styles.content, className].filter(Boolean).join(' ')}
      data-slot="accordion-content"
      data-state={isOpen ? 'open' : 'closed'}
      style={
        {
          '--accordion-content-height': isOpen
            ? `${contentRef.current?.scrollHeight}px`
            : '0px',
        } as React.CSSProperties
      }
      {...rest}
    >
      <div className={styles.contentInner}>{children}</div>
    </div>
  );
};

// Compound export
export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
});

Accordion.displayName = 'Accordion';
AccordionItem.displayName = 'Accordion.Item';
AccordionTrigger.displayName = 'Accordion.Trigger';
AccordionContent.displayName = 'Accordion.Content';

export default Accordion;
