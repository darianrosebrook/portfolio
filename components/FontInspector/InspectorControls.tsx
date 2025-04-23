import { useInspector } from './FontInspector';
import styles from './FontInspector.module.scss';
function toTitleCase(str: string) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/*
  InspectorControls
  allows for a user to copy the unicode, name, or the glyph itself
  Font Selector| Unicode | Name | Glyph Preview |
*/
export const InspectorControls: React.FC = () => {
  const {
    font,
    glyphUnicode,
    axisValues,
    fonts,
    currentFontIndex,
    setCurrentFont,
  } = useInspector();
  if (!font) return null;
  const instance = font.getVariation(axisValues);
  const glyph = instance.glyphForCodePoint(glyphUnicode);
  const name = toTitleCase(glyph?.name || '');
  const unicode = `U+${glyphUnicode.toString(16).toUpperCase()}`;
  const glyphPreview = `${String.fromCodePoint(glyphUnicode)}`;
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  return (
    <div className={styles.inspectorControls}>
      <select
        className={styles.fontSelector}
        value={currentFontIndex}
        onChange={(e) => setCurrentFont(Number(e.target.value))}
      >
        {fonts.map((fontInfo, index) => (
          <option key={fontInfo.name} value={index}>
            {fontInfo.name}
          </option>
        ))}
      </select>
      <button
        className={styles.idUnicode}
        onClick={() => handleCopy(unicode)}
        title="Copy Unicode"
      >
        {unicode}
      </button>
      <button
        className={styles.idName}
        onClick={() => handleCopy(name)}
        title="Copy Name"
      >
        {name}
      </button>
      <button
        className={styles.preview}
        onClick={() => handleCopy(glyphPreview)}
        title="Copy Glyph"
      >
        {glyphPreview}
      </button>
    </div>
  );
};
