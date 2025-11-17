import { calculateContrast } from '@/utils/helpers/colorHelpers';
import Style from './swatches.module.scss';
type ColorSwatchProps = {
  token: string;
  value: string;
  colorName: string;
};

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  token,
  value,
  colorName,
}) => {
  const textColor = calculateContrast(value) > 128 ? 'black' : 'white';
  const borderColor = textColor;

  return (
    <div className={Style.isometricContainer}>
      <svg
        width="142"
        height="265"
        viewBox="0 0 142 265"
        xmlns="http://www.w3.org/2000/svg"
        className={Style.isometricColorSwatch}
        style={{ fill: value, stroke: borderColor }}
      >
        <use xlinkHref="#isometric" />
      </svg>
      <div
        className={Style.isometricText}
        style={{ color: textColor, whiteSpace: 'nowrap' }}
      >
        <div>
          <p>{colorName}</p>
          <p>
            <small>{value}</small>
          </p>
          <p>
            <small>{token}</small>
          </p>
        </div>
      </div>
    </div>
  );
};
