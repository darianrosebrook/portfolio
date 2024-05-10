"use client";
import styles from "./toggleSwitch.module.css";

const ToggleSwitch = ({ checked, onChange, children }) => {
  return (
    <div className={styles.toggleSwitch}>
      <input
        type="checkbox"
        checked={checked}
        className={checked  ? styles.checked : undefined}
        onChange={onChange}
        id={`toggleSwitch-${children}`}
      />
      <label
        className={checked  ? styles.checked : undefined}
        htmlFor={`toggleSwitch-${children}`}
      >
        {children}
      </label>
    </div>
  );
};
export default ToggleSwitch;
