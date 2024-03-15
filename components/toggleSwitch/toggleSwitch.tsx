"use client";
import styles from "./toggleSwitch.module.css";

const ToggleSwitch = ({ checked, onChange, children }) => {
  return (
    <div className={styles.toggleSwitch}>
      <input
        type="checkbox"
        checked={checked}
        className={checked && styles.checked}
        onChange={onChange}
        id={`toggleSwitch-${children}`}
      />
      <label
        className={checked && styles.checked}
        htmlFor={`toggleSwitch-${children}`}
      >
        {children}
      </label>
    </div>
  );
};
export default ToggleSwitch;
