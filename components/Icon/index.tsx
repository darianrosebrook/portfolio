import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type IconProps = {
  icon: IconProp;
  width?: number;
  height?: number;
};

const Icon = ({ icon, width = 20, height = 20 }: IconProps) => {
  return <FontAwesomeIcon icon={icon} width={width} height={height} />;
};

export default Icon;
