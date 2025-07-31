import { useEffect, useRef, useState } from 'react';

/**
 * Interface for gooey highlight options
 */
interface GooeyHighlightOptions {
  /** Custom highlight color */
  highlightColor?: string;
  /** Custom text color */
  textColor?: string;
  /** Whether to enable interactive highlighting */
  interactive?: boolean;
  /** Custom highlight name for CSS Custom Highlight API */
  highlightName?: string;
}

/**
 * Interface for highlight range data
 */
interface HighlightRange {
  start: number;
  end: number;
  text: string;
}

/**
 * Hook for managing gooey text highlights
 */
export const useGooeyHighlight = (options: GooeyHighlightOptions = {}) => {
  const {
    highlightColor,
    textColor,
    interactive = true,
    highlightName = 'gooey-highlight',
  } = options;

  const [highlights, setHighlights] = useState<HighlightRange[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if CSS Custom Highlight API is supported
    setIsSupported(!!CSS.highlights);
  }, []);

  /**
   * Creates a highlight for the given text range
   */
  const createHighlight = (range: Range) => {
    if (!isSupported || !CSS.highlights) return;

    const highlight = new Highlight(range);
    CSS.highlights.set(highlightName, highlight);
  };

  /**
   * Clears all highlights
   */
  const clearHighlights = () => {
    if (!isSupported || !CSS.highlights) return;
    CSS.highlights.clear();
    setHighlights([]);
  };

  /**
   * Highlights specific words in the text
   */
  const highlightWords = (words: string[]) => {
    if (!textRef.current || !isSupported) return;

    const textNode = textRef.current.firstChild;
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;

    const text = textNode.textContent || '';
    const ranges: Range[] = [];
    const highlightRanges: HighlightRange[] = [];

    words.forEach((word) => {
      const startIndex = text.toLowerCase().indexOf(word.toLowerCase());
      if (startIndex !== -1) {
        const range = document.createRange();
        range.setStart(textNode, startIndex);
        range.setEnd(textNode, startIndex + word.length);
        ranges.push(range);

        highlightRanges.push({
          start: startIndex,
          end: startIndex + word.length,
          text: word,
        });
      }
    });

    if (ranges.length > 0) {
      setHighlights(highlightRanges);
      ranges.forEach(createHighlight);
    }
  };

  /**
   * Handles text selection and creates gooey highlights
   */
  const handleSelection = () => {
    if (!interactive || !textRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    clearHighlights();

    const ranges: Range[] = [];
    const highlightRanges: HighlightRange[] = [];

    for (let i = 0; i < selection.rangeCount; i++) {
      const range = selection.getRangeAt(i);
      ranges.push(range);

      highlightRanges.push({
        start: range.startOffset,
        end: range.endOffset,
        text: range.toString(),
      });
    }

    if (ranges.length > 0) {
      setHighlights(highlightRanges);
      ranges.forEach(createHighlight);
    }
  };

  /**
   * Handles click events to create manual highlights
   */
  const handleClick = (event: React.MouseEvent) => {
    if (!interactive || !textRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    // Create a range for the clicked word
    const range = document.createRange();
    const textNode = textRef.current.firstChild;

    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      const text = textNode.textContent || '';
      const clickX = event.clientX;
      const rect = textRef.current.getBoundingClientRect();
      const relativeX = clickX - rect.left;

      // Simple word boundary detection
      const charIndex = Math.floor((relativeX / rect.width) * text.length);
      const words = text.split(/\s+/);
      let currentIndex = 0;

      for (const word of words) {
        const wordStart = text.indexOf(word, currentIndex);
        const wordEnd = wordStart + word.length;

        if (charIndex >= wordStart && charIndex <= wordEnd) {
          range.setStart(textNode, wordStart);
          range.setEnd(textNode, wordEnd);
          break;
        }
        currentIndex = wordEnd + 1;
      }

      if (!range.collapsed) {
        createHighlight(range);
        setHighlights([
          {
            start: range.startOffset,
            end: range.endOffset,
            text: range.toString(),
          },
        ]);
      }
    }
  };

  return {
    textRef,
    highlights,
    isSupported,
    clearHighlights,
    highlightWords,
    handleSelection,
    handleClick,
    highlightColor,
    textColor,
  };
};

/**
 * Utility function to create a gooey highlight for a specific text range
 */
export const createGooeyHighlight = (
  element: HTMLElement,
  startOffset: number,
  endOffset: number,
  highlightName = 'gooey-highlight'
) => {
  if (!CSS.highlights) return false;

  const textNode = element.firstChild;
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return false;

  const range = document.createRange();
  range.setStart(textNode, startOffset);
  range.setEnd(textNode, endOffset);

  const highlight = new Highlight(range);
  CSS.highlights.set(highlightName, highlight);

  return true;
};

/**
 * Utility function to clear all gooey highlights
 */
export const clearGooeyHighlights = (highlightName = 'gooey-highlight') => {
  if (!CSS.highlights) return false;

  CSS.highlights.delete(highlightName);
  return true;
};
