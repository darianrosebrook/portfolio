'use client';

import React from 'react';
import { useGooeyHighlight } from '@/utils/gooeyHighlight';
import styles from './GooeyHighlight.module.scss';

/**
 * GooeyHighlight component that demonstrates gooey text highlighting
 * with both manual highlighting and CSS Custom Highlight API
 */
interface GooeyHighlightProps {
  /** The text content to display */
  children: string;
  /** Whether to enable interactive highlighting */
  interactive?: boolean;
  /** Custom highlight color */
  highlightColor?: string;
  /** Custom text color */
  textColor?: string;
}

export const GooeyHighlight: React.FC<GooeyHighlightProps> = ({
  children,
  interactive = true,
  highlightColor,
  textColor,
}) => {
  const {
    textRef,
    // highlights,
    isSupported,
    clearHighlights,
    highlightWords,
    handleSelection,
    handleClick,
  } = useGooeyHighlight({
    interactive,
    highlightColor,
    textColor,
  });

  /**
   * Creates a manual highlight for demonstration
   */
  const createDemoHighlight = () => {
    if (!isSupported) return;

    const demoWords = ['gooey', 'highlight', 'effect'];
    highlightWords(demoWords);
  };

  return (
    <div className={styles.gooeyHighlightContainer}>
      <div className={styles.controls}>
        <button
          onClick={createDemoHighlight}
          className={styles.demoButton}
          disabled={!isSupported}
        >
          Demo Highlight
        </button>
        <button
          onClick={clearHighlights}
          className={styles.clearButton}
          disabled={!isSupported}
        >
          Clear Highlights
        </button>
      </div>

      <div className={styles.textContainer}>
        <div
          ref={textRef}
          className={`${styles.highlightableText} ${styles.gooeyHighlightWrapper}`}
          onMouseUp={handleClick}
          onClick={handleClick}
          onSelect={handleSelection}
          onMouseDown={handleSelection}
          onKeyDown={() => null}
          style={
            {
              '--highlight-color': highlightColor,
              '--text-color': textColor,
            } as React.CSSProperties
          }
        >
          {children}
        </div>
      </div>

      {!isSupported && (
        <div className={styles.fallbackMessage}>
          <p>CSS Custom Highlight API not supported in this browser.</p>
          <p>
            Try selecting text manually or use the demo button for a fallback
            experience.
          </p>
        </div>
      )}

      <div className={styles.instructions}>
        <h4>How to use:</h4>
        <ul>
          <li>Click and drag to select text for gooey highlighting</li>
          <li>Click on individual words to highlight them</li>
          <li>Use the demo button to see pre-defined highlights</li>
          <li>Clear button removes all highlights</li>
        </ul>
      </div>
    </div>
  );
};

export default GooeyHighlight;
