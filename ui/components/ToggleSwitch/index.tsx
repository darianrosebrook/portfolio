/**
 * @deprecated ToggleSwitch has been renamed to Switch.
 * Use Switch component instead.
 * This alias will be removed in a future version.
 */
import Switch, { SwitchGroup } from '../Switch';

// Re-export Switch as ToggleSwitch for backwards compatibility
export default Switch;
export { SwitchGroup as ToggleSwitchGroup };

// Also export the types for backwards compatibility
export type { SwitchProps as ToggleSwitchProps } from '../Switch/Switch';
