'use client';

import { glossaryItems, type GlossaryItem } from '@/app/heroes/glossaryItems';
import React, { useEffect, useRef, useState } from 'react';
import styles from './GlossaryPopover.module.scss';

interface GlossaryPopoverProps {
  termId: string;
  children: React.ReactNode;
}

export function GlossaryPopover({ termId, children }: GlossaryPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [glossaryItem, setGlossaryItem] = useState<GlossaryItem | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const item = glossaryItems.find((item) => item.id === termId);
    setGlossaryItem(item || null);
  }, [termId]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!glossaryItem) {
    return <>{children}</>;
  }

  return (
    <span className={styles.container}>
      <span
        ref={triggerRef}
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`${glossaryItem.name} - Click for definition`}
      >
        {children}
      </span>
      {isOpen && (
        <div
          ref={popoverRef}
          className={styles.popover}
          role="dialog"
          aria-labelledby={`glossary-${termId}-title`}
          aria-describedby={`glossary-${termId}-description`}
        >
          <div className={styles.popoverHeader}>
            <h4 id={`glossary-${termId}-title`} className={styles.popoverTitle}>
              {glossaryItem.name}
            </h4>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Close definition"
            >
              ×
            </button>
          </div>
          <p
            id={`glossary-${termId}-description`}
            className={styles.popoverDescription}
          >
            {glossaryItem.description}
          </p>
          {glossaryItem.resources && glossaryItem.resources.length > 0 && (
            <div className={styles.popoverResources}>
              <strong>Resources:</strong>
              <ul>
                {glossaryItem.resources.slice(0, 3).map((resource, idx) => (
                  <li key={idx}>
                    <a
                      href={resource.href}
                      target={resource.external ? '_blank' : undefined}
                      rel={
                        resource.external ? 'noopener noreferrer' : undefined
                      }
                      className={styles.resourceLink}
                    >
                      {resource.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </span>
  );
}
