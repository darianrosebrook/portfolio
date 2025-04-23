// types/fontkit/index.d.ts
declare module 'fontkit' {
  import { EventEmitter } from 'events';

  // ——————————————————————————————————————————————
  // Top‑level API
  // ——————————————————————————————————————————————

  /**
   * Opens a font file asynchronously.
   * If the file is a collection and you pass `postscriptName`, you'll get that Font;
   * otherwise you may get a Collection.
   */
  export function open(
    path: string,
    postscriptName?: string
  ): Promise<Font | Collection>;

  /** Synchronous version of `open` */
  export function openSync(
    path: string,
    postscriptName?: string
  ): Font | Collection;

  /**
   * Create a font from a binary buffer (TTF, OTF, etc).
   * Accepts Uint8Array (or Node Buffer) and optional postscriptName for collections.
   */
  export function create(
    buffer: Uint8Array,
    postscriptName?: string
  ): Font | Collection;

  /** Default export */
  const fontkit: {
    open: typeof open;
    openSync: typeof openSync;
    create: typeof create;
  };
  export default fontkit;

  // ——————————————————————————————————————————————
  // Shared Types
  // ——————————————————————————————————————————————

  /** A generic four‑corner bounding box */
  export interface BBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  }

  /** A single OpenType / AAT variation axis */
  export interface Axis {
    name: string;
    min: number;
    default: number;
    max: number;
  }

  /** A settings object for variation axes */
  export interface AxisValues {
    [axisTag: string]: number;
  }

  /** One glyph position in a run */
  export interface GlyphPosition {
    xAdvance: number;
    yAdvance: number;
    xOffset: number;
    yOffset: number;
  }

  /** A laid‑out string: glyphs + positions */
  export interface GlyphRun {
    glyphs: Glyph[];
    positions: GlyphPosition[];
  }

  // ——————————————————————————————————————————————
  // Font / Collection
  // ——————————————————————————————————————————————

  /**
   * A single font (TTF, OTF, variable, color, etc).
   * Emits (via EventEmitter) for subset progress, etc.
   */
  export interface Font extends EventEmitter {
    // metadata
    postscriptName: string | null;
    fullName: string | null;
    familyName: string | null;
    subfamilyName: string | null;
    copyright: string | null;
    version: string | null;

    // metrics
    unitsPerEm: number;
    ascent: number;
    descent: number;
    lineGap: number;
    underlinePosition: number;
    underlineThickness: number;
    italicAngle: number;
    capHeight: number;
    xHeight: number;
    bbox: BBox;

    // other properties
    numGlyphs: number;
    characterSet: number[];
    availableFeatures: string[];

    // variation support
    variationAxes: Record<string, Axis>;
    namedVariations: Record<string, AxisValues>;
    getVariation(variation: AxisValues | string): Font;

    // character → glyph mapping
    glyphForCodePoint(codePoint: number): Glyph;
    hasGlyphForCodePoint(codePoint: number): boolean;
    glyphsForString(str: string): Glyph[];

    // glyph metrics & layout
    widthOfGlyph(glyphID: number): number;
    layout(
      text: string,
      features?: string[] | Record<string, boolean>
    ): GlyphRun;

    // lower‑level glyph access
    getGlyph(glyphID: number, codePoints?: number[]): Glyph;

    // subsetting
    createSubset(): Subset;
  }

  /**
   * A collection of fonts in one file (.ttc, .dfont).
   */
  export interface Collection {
    fonts: Font[];
    getFont(postscriptName: string): Font;
  }

  // ——————————————————————————————————————————————
  // Glyph
  // ——————————————————————————————————————————————

  export interface Glyph {
    id: number;
    name: string;
    codePoints: number[];
    path: Path;
    bbox: BBox;
    cbox: BBox;
    advanceWidth: number;

    /** draw to a Canvas or other 2D context at given size */
    render(
      ctx: CanvasRenderingContext2D | CanvasRenderingContext2D,
      size: number
    ): void;

    /**** Color‐glyph API ****/
    /** SBIX bitmap emojis */
    getImageForSize?(size: number): {
      data: Uint8Array;
      width: number;
      height: number;
    };

    /** COLR vector emojis */
    layers?: Array<{ glyph: number; color: string }>;
  }

  // ——————————————————————————————————————————————
  // Path
  // ——————————————————————————————————————————————

  /** Vector outline for a glyph */
  export interface Path {
    /** The raw drawing commands */

    commands: Array<{ command: string; args: number[] }>;

    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    bezierCurveTo(
      cp1x: number,
      cp1y: number,
      cp2x: number,
      cp2y: number,
      x: number,
      y: number
    ): void;
    closePath(): void;

    /** Returns a JS function `(ctx)=>void` that will replay the path */
    toFunction(): (ctx: CanvasRenderingContext2D) => void;

    /** Returns an SVG `d="…"` string */
    toSVG(): string;

    /** exact and fast bounding boxes */
    bbox: BBox;
    cbox: BBox;
  }

  // ——————————————————————————————————————————————
  // Subset
  // ——————————————————————————————————————————————

  /**
   * A font subset builder.
   * Emits progress events as you include glyphs.
   */
  export interface Subset extends EventEmitter {
    includeGlyph(glyph: Glyph | number): void;
    encode(): Uint8Array;
  }
}
