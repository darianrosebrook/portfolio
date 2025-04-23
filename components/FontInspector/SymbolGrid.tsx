import { useInspector } from './FontInspector';
import styles from './FontInspector.module.scss';
import { useMemo } from 'react';
/*
  SymbolGrid
  allows for a user to select a glyph from a grid of glyphs
*/

export const SymbolGrid: React.FC = () => {
  const { font, glyphUnicode, setGlyphUnicode } = useInspector();

  // derive codepoints array from font.characterSet
  const codepoints = useMemo(
    () => (font ? [...font.characterSet] : ([] as number[])),
    [font]
  );

  if (!font) return null;
  return (
    <section className={styles.symbolGrid}>
      {codepoints.map((u) => (
        <button
          key={u}
          className={`${styles.symbolSelectorButton} ${
            u === glyphUnicode ? styles.selected : ''
          }`}
          onClick={() => setGlyphUnicode(u)}
        >
          {String.fromCodePoint(u)}
        </button>
      ))}
    </section>
  );
};
