export type FeatureKey =
  | 'apex'
  | 'aperture'
  | 'arc'
  | 'arm'
  | 'bar'
  | 'beak'
  | 'bowl'
  | 'bracket'
  | 'counter'
  | 'crotch'
  | 'crossbar'
  | 'crossstroke'
  | 'ear'
  | 'eye'
  | 'finial'
  | 'foot'
  | 'hook'
  | 'leg'
  | 'link'
  | 'loop'
  | 'neck'
  | 'serif'
  | 'shoulder'
  | 'spine'
  | 'spur'
  | 'stem'
  | 'tail'
  | 'terminal'
  | 'tittle'
  | 'vertex';

/**
 * Canonical mapping of glyphs to their likely typographic anatomy features.
 *
 * Notes:
 * - Diacritics inherit the base letter's features plus any additional marks
 * - Some features like 'serif' are font-dependent (check font metadata)
 * - 'stem' requires font instance for accurate detection
 * - Ligatures may have features from their component letters
 * - Some ligatures (fi, fl, etc.) are font-dependent and may not exist in all fonts
 *
 * Usage: Use this to test features on glyphs that are known to have them.
 */
export const LetterFeatureHints: Record<string, FeatureKey[]> = {
  // Lowercase
  a: ['bowl', 'counter', 'aperture', 'arc', 'finial', 'loop', 'terminal'],
  b: ['bowl', 'counter', 'loop', 'stem', 'foot'],
  c: ['aperture', 'finial', 'terminal'],
  d: ['bowl', 'counter', 'loop', 'stem', 'foot'],
  e: ['bowl', 'counter', 'eye', 'aperture', 'crossbar', 'finial'],
  f: ['crossstroke', 'hook', 'tail', 'stem'],
  g: ['bowl', 'counter', 'ear', 'tail', 'loop', 'link'],
  h: ['stem', 'shoulder', 'foot'],
  i: ['tittle', 'stem', 'foot'],
  j: ['tittle', 'tail', 'hook', 'stem'],
  k: ['stem', 'leg'],
  l: ['stem', 'foot'],
  m: ['stem', 'shoulder', 'foot'],
  n: ['stem', 'shoulder', 'foot'],
  o: ['bowl', 'counter'],
  p: ['bowl', 'counter', 'tail', 'loop', 'stem'],
  q: ['bowl', 'counter', 'tail', 'loop'],
  r: ['ear', 'finial', 'terminal'],
  s: ['spine', 'finial'],
  t: ['crossstroke', 'stem'],
  u: ['stem', 'arc', 'foot'],
  v: ['vertex', 'crotch'],
  w: ['vertex', 'crotch'],
  x: [],
  y: ['tail', 'vertex', 'crotch'],
  z: ['finial'],

  // Uppercase
  A: ['apex', 'aperture', 'crotch', 'crossbar', 'stem', 'foot'],
  B: ['bowl', 'counter', 'stem', 'foot'],
  C: ['aperture', 'finial', 'terminal'],
  D: ['bowl', 'counter', 'stem', 'foot'],
  E: ['arm', 'aperture', 'crossbar', 'stem', 'foot'],
  F: ['arm', 'crossbar', 'beak', 'stem', 'foot'],
  G: ['aperture', 'finial', 'spur', 'stem'],
  H: ['crossbar', 'stem', 'foot'],
  I: ['stem', 'foot'],
  J: ['tail', 'hook', 'stem'],
  K: ['stem', 'leg', 'neck'],
  L: ['arm', 'stem', 'foot'],
  M: ['apex', 'stem', 'foot'],
  N: ['apex', 'stem', 'foot'],
  O: ['bowl', 'counter'],
  P: ['bowl', 'counter', 'stem', 'foot'],
  Q: ['bowl', 'counter', 'tail'],
  R: ['bowl', 'counter', 'stem', 'leg', 'neck'],
  S: ['spine', 'finial', 'beak'],
  T: ['arm', 'crossbar', 'beak', 'stem'],
  U: ['stem'],
  V: ['vertex', 'crotch'],
  W: ['apex', 'vertex', 'crotch'],
  X: [],
  Y: ['vertex', 'crotch'],
  Z: ['finial'],

  // Diacritics - Acute (é, á, í, ó, ú, É, Á, Í, Ó, Ú)
  á: ['bowl', 'counter', 'finial', 'loop'],
  é: ['bowl', 'counter', 'eye', 'crossbar', 'finial'],
  í: ['tittle', 'stem'],
  ó: ['bowl', 'counter'],
  ú: ['stem'],
  Á: ['apex', 'crotch', 'crossbar', 'stem'],
  É: ['arm', 'crossbar', 'stem'],
  Í: ['stem'],
  Ó: ['bowl', 'counter'],
  Ú: ['stem'],

  // Diacritics - Grave (à, è, ì, ò, ù, À, È, Ì, Ò, Ù)
  à: ['bowl', 'counter', 'finial', 'loop'],
  è: ['bowl', 'counter', 'eye', 'crossbar', 'finial'],
  ì: ['tittle', 'stem'],
  ò: ['bowl', 'counter'],
  ù: ['stem'],
  À: ['apex', 'crotch', 'crossbar', 'stem'],
  È: ['arm', 'crossbar', 'stem'],
  Ì: ['stem'],
  Ò: ['bowl', 'counter'],
  Ù: ['stem'],

  // Diacritics - Circumflex (â, ê, î, ô, û, Â, Ê, Î, Ô, Û)
  â: ['bowl', 'counter', 'finial', 'loop'],
  ê: ['bowl', 'counter', 'eye', 'crossbar', 'finial'],
  î: ['tittle', 'stem'],
  ô: ['bowl', 'counter'],
  û: ['stem'],
  Â: ['apex', 'crotch', 'crossbar', 'stem'],
  Ê: ['arm', 'crossbar', 'stem'],
  Î: ['stem'],
  Ô: ['bowl', 'counter'],
  Û: ['stem'],

  // Diacritics - Tilde (ã, ñ, õ, Ã, Ñ, Õ)
  ã: ['bowl', 'counter', 'finial', 'loop'],
  ñ: ['stem'],
  õ: ['bowl', 'counter'],
  Ã: ['apex', 'crotch', 'crossbar', 'stem'],
  Ñ: ['stem'],
  Õ: ['bowl', 'counter'],

  // Diacritics - Umlaut/Diaeresis (ä, ë, ï, ö, ü, Ä, Ë, Ï, Ö, Ü)
  ä: ['bowl', 'counter', 'finial', 'loop'],
  ë: ['bowl', 'counter', 'eye', 'crossbar', 'finial'],
  ï: ['tittle', 'stem'],
  ö: ['bowl', 'counter'],
  ü: ['stem'],
  Ä: ['apex', 'crotch', 'crossbar', 'stem'],
  Ë: ['arm', 'crossbar', 'stem'],
  Ï: ['stem'],
  Ö: ['bowl', 'counter'],
  Ü: ['stem'],

  // Diacritics - Ring (å, Å)
  å: ['bowl', 'counter', 'finial', 'loop'],
  Å: ['apex', 'crotch', 'crossbar', 'stem'],

  // Diacritics - Cedilla (ç, Ç)
  ç: ['finial'],
  Ç: ['finial'],

  // Diacritics - Caron/Hacek (č, ď, ě, ň, ř, š, ť, ž, Č, Ď, Ě, Ň, Ř, Š, Ť, Ž)
  č: ['finial'],
  ď: ['bowl', 'counter', 'loop', 'stem'],
  ě: ['bowl', 'counter', 'eye', 'crossbar', 'finial'],
  ň: ['stem'],
  ř: ['ear', 'finial'],
  š: ['finial'],
  ť: ['crossbar', 'stem'],
  ž: ['finial'],
  Č: ['finial'],
  Ď: ['bowl', 'counter', 'stem'],
  Ě: ['arm', 'crossbar', 'stem'],
  Ň: ['stem'],
  Ř: ['bowl', 'counter', 'stem'],
  Š: ['finial'],
  Ť: ['arm', 'crossbar', 'stem'],
  Ž: ['finial'],

  // Diacritics - Macron (ā, ē, ī, ō, ū, Ā, Ē, Ī, Ō, Ū)
  ā: ['bowl', 'counter', 'finial', 'loop'],
  ē: ['bowl', 'counter', 'eye', 'crossbar', 'finial'],
  ī: ['tittle', 'stem'],
  ō: ['bowl', 'counter'],
  ū: ['stem'],
  Ā: ['apex', 'crotch', 'crossbar', 'stem'],
  Ē: ['arm', 'crossbar', 'stem'],
  Ī: ['stem'],
  Ō: ['bowl', 'counter'],
  Ū: ['stem'],

  // Diacritics - Breve (ă, ĕ, ĭ, ŏ, ŭ, Ă, Ĕ, Ĭ, Ŏ, Ŭ)
  ă: ['bowl', 'counter', 'finial', 'loop'],
  ĕ: ['bowl', 'counter', 'eye', 'crossbar', 'finial'],
  ĭ: ['tittle', 'stem'],
  ŏ: ['bowl', 'counter'],
  ŭ: ['stem'],
  Ă: ['apex', 'crotch', 'crossbar', 'stem'],
  Ĕ: ['arm', 'crossbar', 'stem'],
  Ĭ: ['stem'],
  Ŏ: ['bowl', 'counter'],
  Ŭ: ['stem'],

  // Diacritics - Dot above (ȧ, ė, ġ, ż, Ȧ, Ė, Ġ, Ż)
  ȧ: ['bowl', 'counter', 'finial', 'loop'],
  ė: ['bowl', 'counter', 'eye', 'crossbar', 'finial'],
  ġ: ['bowl', 'counter', 'ear', 'tail', 'loop'],
  ż: ['finial'],
  Ȧ: ['apex', 'crotch', 'crossbar', 'stem'],
  Ė: ['arm', 'crossbar', 'stem'],
  Ġ: ['finial', 'stem'],
  Ż: ['finial'],

  // Diacritics - Ogonek (ą, ę, į, ǫ, ų, Ą, Ę, Į, Ǫ, Ų)
  ą: ['bowl', 'counter', 'finial', 'loop'],
  ę: ['bowl', 'counter', 'eye', 'crossbar', 'finial'],
  į: ['tittle', 'stem'],
  ǫ: ['bowl', 'counter'],
  ų: ['stem'],
  Ą: ['apex', 'crotch', 'crossbar', 'stem'],
  Ę: ['arm', 'crossbar', 'stem'],
  Į: ['stem'],
  Ǫ: ['bowl', 'counter'],
  Ų: ['stem'],

  // Diacritics - Double acute (ő, ű, Ő, Ű)
  ő: ['bowl', 'counter'],
  ű: ['stem'],
  Ő: ['bowl', 'counter'],
  Ű: ['stem'],

  // Diacritics - Stroke (đ, Đ, ħ, Ħ, ł, Ł, ŧ, Ŧ)
  đ: ['bowl', 'counter', 'finial', 'loop'],
  Đ: ['bowl', 'counter', 'stem'],
  ħ: ['stem'],
  Ħ: ['crossbar', 'stem'],
  ł: ['stem'],
  Ł: ['stem'],
  ŧ: ['crossbar', 'stem'],
  Ŧ: ['arm', 'crossbar', 'stem'],

  // Ligatures and compound glyphs
  æ: ['bowl', 'counter', 'finial', 'loop'], // ae ligature
  œ: ['bowl', 'counter'], // oe ligature
  Æ: ['apex', 'crotch', 'crossbar', 'stem'], // AE ligature
  Œ: ['bowl', 'counter'], // OE ligature
  ß: ['finial', 'stem'], // German sharp s (can have multiple stems)
  ĳ: ['tittle', 'stem'], // ij ligature
  Ĳ: ['stem'], // IJ ligature

  // Typographic ligatures (often font-dependent)
  // These are typically single glyphs but may decompose
  ﬁ: ['finial', 'stem'], // fi ligature
  ﬂ: ['finial', 'stem'], // fl ligature
  ﬀ: ['finial', 'stem'], // ff ligature
  ﬃ: ['finial', 'stem'], // ffi ligature
  ﬄ: ['finial', 'stem'], // ffl ligature
  ﬅ: ['finial', 'stem'], // st ligature
};
