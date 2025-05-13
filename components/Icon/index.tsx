import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type IconProps = {
  icon: IconProp;
};

const Icon = ({ icon }: IconProps) => {
  return <FontAwesomeIcon width={20} height={20} icon={icon} />;
};

export default Icon;
