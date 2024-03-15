import styles from "./iconButton.module.css";
export default function IconButton({
  size,
  children,
  href = null,
  external = false,
}) {
  // button as either anchor or button
  const button = href ? (
    <a
      className={styles.iconButton}
      href={href}
      target={external ? "_blank" : ""}
      rel={external ? "noreferrer" : ""}
    >
      {children}
    </a>
  ) : (
    <button className={styles.iconButton}>{children}</button>
  );
  return  <>{button}</>
}
