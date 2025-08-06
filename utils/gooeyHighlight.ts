/**
 * Utility functions and hooks for gooey text highlighting
 * Provides helper functions for creating gooey highlight effects
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';

/**
 * Wraps text with gooey highlight styling
 * @param text - The text to highlight
 * @param backgroundColor - Background color for the highlight
 * @param textColor - Text color for the highlighted text
 * @returns React element with gooey highlight wrapper
 */
export function wrapWithGooeyHighlight(
  text: string,
  backgroundColor: string = 'var(--color-core-blue-200)',
  textColor: string = 'var(--color-core-blue-800)'
): React.ReactElement {
  return React.createElement(
    'span',
    {
      className: 'gooey-highlight-wrapper',
      style: {
        position: 'relative',
        display: 'inline-block',
        color: textColor,
      },
    },
    [
      React.createElement('span', {
        key: 'background',
        className: 'gooey-highlight-background',
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor,
          filter: 'url(#goo-text)',
          borderRadius: '0.25rem',
          zIndex: -1,
        },
      }),
      React.createElement(
        'span',
        {
          key: 'text',
          className: 'gooey-highlight-text',
          style: {
            position: 'relative',
            zIndex: 1,
            padding: '0.125rem 0.25rem',
          },
        },
        text
      ),
    ]
  );
}

/**
 * Creates a gooey highlight CSS class name
 * @param variant - The variant of the gooey effect
 * @returns CSS class name
 */
export function getGooeyHighlightClass(
  variant: 'default' | 'subtle' | 'strong' = 'default'
): string {
  switch (variant) {
    case 'subtle':
      return 'gooey-highlight-subtle';
    case 'strong':
      return 'gooey-highlight-strong';
    default:
      return 'gooey-highlight';
  }
}

/**
 * Checks if the browser supports CSS Custom Highlight API
 * @returns boolean indicating support
 */
export function supportsCustomHighlightAPI(): boolean {
  if (typeof window === 'undefined') return false;
  return 'highlights' in CSS && !!CSS.highlights;
}

/**
 * Creates a custom highlight range for text selection
 * @param selector - CSS selector for the target element
 * @param text - Text to highlight
 * @param highlightName - Name for the highlight
 */
export function createCustomHighlight(
  selector: string,
  text: string,
  highlightName: string = 'gooey-highlight'
): void {
  if (!supportsCustomHighlightAPI()) {
    console.warn('CSS Custom Highlight API not supported');
    return;
  }

  const targetElement = document.querySelector(selector);
  if (!targetElement) {
    console.warn(`Element not found: ${selector}`);
    return;
  }

  const walker = document.createTreeWalker(targetElement, NodeFilter.SHOW_TEXT);

  const textNodes: Text[] = [];
  let node: Node | null;

  while ((node = walker.nextNode())) {
    if (node.textContent?.includes(text)) {
      textNodes.push(node as Text);
    }
  }

  const ranges: Range[] = [];

  textNodes.forEach((textNode) => {
    const content = textNode.textContent || '';
    const index = content.indexOf(text);

    if (index !== -1) {
      const range = new Range();
      range.setStart(textNode, index);
      range.setEnd(textNode, index + text.length);
      ranges.push(range);
    }
  });

  if (ranges.length > 0 && CSS.highlights) {
    const highlight = new Highlight(...ranges);
    CSS.highlights.set(highlightName, highlight);
  }
}

/**
 * Removes a custom highlight
 * @param highlightName - Name of the highlight to remove
 */
export function removeCustomHighlight(
  highlightName: string = 'gooey-highlight'
): void {
  if (supportsCustomHighlightAPI() && CSS.highlights) {
    CSS.highlights.delete(highlightName);
  }
}

/**
 * Hook for gooey text highlighting functionality
 */
interface UseGooeyHighlightOptions {
  interactive?: boolean;
  highlightColor?: string;
  textColor?: string;
}

export function useGooeyHighlight(options: UseGooeyHighlightOptions = {}) {
  const { interactive = true, highlightColor, textColor } = options;
  const textRef = useRef<HTMLDivElement>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [highlights, setHighlights] = useState<Map<string, Range[]>>(new Map());

  useEffect(() => {
    setIsSupported(supportsCustomHighlightAPI());
  }, []);

  const clearHighlights = useCallback(() => {
    if (CSS.highlights) {
      CSS.highlights.clear();
    }
    setHighlights(new Map());
  }, []);

  const highlightWords = useCallback(
    (words: string[]) => {
      if (!isSupported || !textRef.current) return;

      words.forEach((word, index) => {
        createCustomHighlight(
          `[data-ref="${textRef.current?.dataset.ref || 'gooey-text'}"]`,
          word,
          `gooey-highlight-${index}`
        );
      });
    },
    [isSupported]
  );

  const handleSelection = useCallback(
    (event: React.SyntheticEvent) => {
      if (!interactive || !isSupported) return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      if (range.collapsed) return;

      const selectedText = selection.toString();
      if (selectedText.trim()) {
        const highlightName = `selection-${Date.now()}`;
        if (CSS.highlights) {
          const highlight = new Highlight(range.cloneRange());
          CSS.highlights.set(highlightName, highlight);
        }
      }
    },
    [interactive, isSupported]
  );

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!interactive || !isSupported) return;

      const target = event.target as HTMLElement;
      if (target.nodeType === Node.TEXT_NODE || target.textContent) {
        // Handle word-level highlighting on click
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();

          // Create a range around the clicked word
          const range = document.createRange();
          const textNode = target.firstChild || target;
          if (textNode.nodeType === Node.TEXT_NODE) {
            const text = textNode.textContent || '';
            const words = text.split(' ');

            // Simple word detection (could be enhanced)
            words.forEach((word, index) => {
              if (word.trim()) {
                const wordStart = text.indexOf(word);
                const wordEnd = wordStart + word.length;
                range.setStart(textNode, wordStart);
                range.setEnd(textNode, wordEnd);

                const highlightName = `word-${Date.now()}-${index}`;
                if (CSS.highlights) {
                  const highlight = new Highlight(range.cloneRange());
                  CSS.highlights.set(highlightName, highlight);
                }
              }
            });
          }
        }
      }
    },
    [interactive, isSupported]
  );

  useEffect(() => {
    if (textRef.current) {
      textRef.current.dataset.ref = 'gooey-text';
    }
  }, []);

  return {
    textRef,
    highlights,
    isSupported,
    clearHighlights,
    highlightWords,
    handleSelection,
    handleClick,
  };
}
