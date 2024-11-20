"use client";
import styles from "./toggleSwitch.module.css";

type ToggleSwitchProps = {
  checked: boolean;
  disabled?: boolean;
  onChange: (e) => void;
  children: string;
};

const ToggleSwitch = ({ checked, disabled = false, onChange, children }: ToggleSwitchProps) => {
  return (
    <div className={styles.toggleSwitch}>
      <input
        type="checkbox"
        checked={checked}
        className={checked ? styles.checked : ''}
        onChange={onChange}
        disabled={disabled}
        id={`toggleSwitch-${children}`}
      />
      <label
        className={checked ? styles.checked : ''}
        htmlFor={`toggleSwitch-${children}`}
      >
        {children}
      </label>
    </div>
  );
}; 
export default ToggleSwitch;
