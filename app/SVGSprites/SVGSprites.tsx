import { SwatchSprite } from './SwatchSprite';
import { SVG_FILTER } from './SVGFilter';
import { SVG_GOO } from './SVGGoo';
import { SVGComponentIllo } from './SVGComponentIllo';

export const SVGSprites = () => {
  return (
    <>
      {SVG_FILTER}
      {SVG_GOO}
      {SwatchSprite}
      {SVGComponentIllo}
    </>
  );
};

export default SVGSprites;
