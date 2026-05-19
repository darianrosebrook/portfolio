import { useInspector } from './FontInspector';
import './FontInspector.css';
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
    <section className="symbolGrid">
      {codepoints.map((u) => (
        <button
          key={u}
          className={`symbolSelectorButton ${
            u === glyphUnicode ? 'selected' : ''
          }`}
          onClick={() => setGlyphUnicode(u)}
        >
          {String.fromCodePoint(u)}
        </button>
      ))}
    </section>
  );
};
