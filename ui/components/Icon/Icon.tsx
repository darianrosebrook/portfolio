import { IconDefinition } from '@awesome.me/kit-0ba7f5fefb/icons';
import './Icon.css';

export type IconProps = {
  icon: IconDefinition;
  width?: number;
  height?: number;
  /**
   * Accessible label. When provided, the icon is exposed as role="img" with
   * this aria-label. When omitted, the icon is treated as decorative and
   * hidden from assistive tech (aria-hidden="true"). Decorative is the right
   * default for icons inside buttons or links that already carry a label.
   */
  label?: string;
};

const Icon = ({ icon, width = 20, height = 20, label }: IconProps) => {
  if (!icon) return null;
  const hasLabel = typeof label === 'string' && label.length > 0;
  // suppressHydrationWarning: Cursor dev tools add data-cursor-element-id attributes
  // client-side which don't exist during SSR, causing hydration mismatches
  return (
    <span
      data-ds-component="Icon"
      className="icon"
      style={{ width, height }}
      data-slot="icon"
      data-icon="true"
      role={hasLabel ? 'img' : undefined}
      aria-label={hasLabel ? label : undefined}
      aria-hidden={hasLabel ? undefined : true}
      suppressHydrationWarning
    >
      <svg
        viewBox={`0 0 ${icon.icon[0]} ${icon.icon[1]}`}
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        suppressHydrationWarning
      >
        <path d={icon.icon[4] as string} suppressHydrationWarning />
      </svg>
    </span>
  );
};

export { Icon };
export default Icon;
