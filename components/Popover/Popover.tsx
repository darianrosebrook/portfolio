'use client';
import React, {
  cloneElement,
  useRef,
  useId,
  useContext,
  createContext,
  useState,
  MutableRefObject,
} from 'react';
import styles from './Popover.module.scss';

interface PopoverProps {
  children: React.ReactNode;
}

interface TriggerProps {
  asChild?: boolean;
  className?: string;
  children: React.ReactElement;
}

interface ContentProps {
  children: React.ReactNode;
  className?: string;
}

interface PopoverContextType {
  popoverId: string;
  triggerRef: MutableRefObject<HTMLElement | null>;
  contentRef: MutableRefObject<HTMLDivElement | null>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const PopoverContext = createContext<PopoverContextType | null>(null);

const Popover: React.FC<PopoverProps> & {
  Trigger: React.FC<TriggerProps>;
  Content: React.FC<ContentProps>;
} = ({ children }) => {
  const popoverId = `popover-${useId()}`;
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <PopoverContext.Provider
      value={{
        popoverId,
        triggerRef,
        contentRef,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </PopoverContext.Provider>
  );
};
const Trigger = ({ asChild = false, className, children }: TriggerProps) => {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error('PopoverTrigger must be used within a Popover');
  }
  const anchorCss = { anchorName: context.popoverId };
  const { isOpen, setIsOpen } = context;
  const handleClick = () => setIsOpen(!isOpen);
  const button = <button>{children}</button>;

  return cloneElement(asChild ? children : button, {
    onClick: handleClick,
    popoverTarget: context.popoverId,
    className: `${styles.popoverTrigger} ${isOpen ? styles.activeTrigger : ''} ${className || ''}`,
    style: anchorCss,
  });
};

Trigger.displayName = 'Trigger';

const Content: React.FC<ContentProps> = ({ children, className }) => {
  const context = useContext(PopoverContext);

  if (!context) {
    throw new Error('Popover.Content must be used within a Popover component');
  }
  const anchorCSS = { positionAnchor: context.popoverId };
  return React.createElement(
    'div',
    {
      className: `${styles.popoverContent} ${className || ''}`,
      style: anchorCSS,
      id: context.popoverId,
      popover: 'manual',
    },
    children
  );
};

Popover.Trigger = Trigger;
Popover.Content = Content;

export default Popover;
