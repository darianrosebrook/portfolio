import { IconDefinition } from '@awesome.me/kit-0ba7f5fefb/icons';
import styles from './Icon.module.scss';

export type IconProps = {
  icon: IconDefinition;
  width?: number;
  height?: number;
};

const Icon = ({ icon, width = 20, height = 20 }: IconProps) => {
  if (!icon) return null;
  // suppressHydrationWarning: Cursor dev tools add data-cursor-element-id attributes
  // client-side which don't exist during SSR, causing hydration mismatches
  return (
    <span
      className={styles.icon}
      style={{ width, height }}
      data-icon="true"
      suppressHydrationWarning
    >
      <svg
        viewBox={`0 0 ${icon.icon[0]} ${icon.icon[1]}`}
        fill="currentColor"
        suppressHydrationWarning
      >
        <path d={icon.icon[4] as string} suppressHydrationWarning />
      </svg>
    </span>
  );
};

export { Icon };
export default Icon;
