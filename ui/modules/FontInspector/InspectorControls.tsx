import { useInspector } from './FontInspector';
import './FontInspector.css';

/*
  InspectorControls
  allows for a user to copy the unicode, name, or the glyph itself
  Font Selector| Unicode | Name | Glyph Preview |
*/
export const InspectorControls: React.FC = () => {
  const {
    glyphUnicode,
    glyph,
    fonts,
    currentFontIndex,
    setCurrentFont,
    retryCurrentFont,
  } = useInspector();
  const currentFont = fonts[currentFontIndex];
  const name = glyph ? glyph.name || '' : 'Glyph unavailable';
  const unicode = `U+${glyphUnicode.toString(16).toUpperCase()}`;
  const glyphPreview = glyph ? String.fromCodePoint(glyphUnicode) : '';
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  return (
    <div className="inspectorControls">
      <select
        aria-label="Font"
        className="fontSelector"
        value={currentFontIndex}
        onChange={(e) => setCurrentFont(Number(e.target.value))}
      >
        {fonts.map((fontInfo, index) => (
          <option key={fontInfo.name} value={index}>
            {fontInfo.name}
            {fontInfo.loadState === 'loading'
              ? ' (loading)'
              : fontInfo.loadState === 'error'
                ? ' (unavailable)'
                : ''}
          </option>
        ))}
      </select>
      <button
        className="idUnicode"
        onClick={() => handleCopy(unicode)}
        title="Copy Unicode"
      >
        {unicode}
      </button>
      <button
        className="idName"
        disabled={!glyph}
        onClick={() => handleCopy(name)}
        title="Copy Name"
      >
        {name}
      </button>
      <button
        className="preview"
        disabled={!glyph}
        onClick={() => handleCopy(glyphPreview)}
        title="Copy Glyph"
      >
        {glyph ? glyphPreview : '—'}
      </button>
      {currentFont && currentFont.loadState !== 'loaded' && (
        <div role="status" style={{ gridColumn: '1 / -1' }}>
          {currentFont.loadState === 'loading'
            ? `Loading ${currentFont.name}…`
            : `Unable to load ${currentFont.name}: ${currentFont.loadError}`}
          {currentFont.loadState === 'error' && (
            <button type="button" onClick={retryCurrentFont}>
              Retry {currentFont.name}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
