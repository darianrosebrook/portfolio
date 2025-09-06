'use client';
import { ReactNode } from 'react';
import styles from './toggleSwitch.module.scss';

type ToggleSwitchProps = React.ComponentProps<'input'> & {
  checked: boolean;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children: ReactNode;
};

const ToggleSwitch = ({ children, ...props }: ToggleSwitchProps) => {
  const { checked, onChange, disabled, ...rest } = props;
  // Generate a safe ID from children - handle both string and ReactNode
  const childrenString =
    typeof children === 'string'
      ? children
      : `toggle-${Math.random().toString(36).substring(2, 9)}`;
  const safeId = `toggleSwitch-${childrenString.replace(/[^\w-]/g, '-')}`;

  return (
    <div className={styles.toggleSwitch}>
      <input
        type="checkbox"
        checked={checked}
        className={checked ? styles.checked : ''}
        onChange={onChange}
        disabled={disabled}
        id={safeId}
        {...rest}
      />
      <label className={checked ? styles.checked : ''} htmlFor={safeId}>
        {children}
      </label>
    </div>
  );
};
export default ToggleSwitch;
