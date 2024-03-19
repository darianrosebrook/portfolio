"use client";
import { forwardRef } from "react";
import styles from "./iconButton.module.css";
interface IconButtonProps {
  size?: "small" | "medium" | "large";
  children: React.ReactNode;
  href?: string | null;
  external?: boolean;
  title?: string;
  handleClick?: () => void;
}
export default function IconButton({
  size,
  children,
  href = null,
  external = false,
  title,
  handleClick,
}: IconButtonProps) {
  const button = href ? (
    <a
      title={title}
      className={`${styles.iconButton} ${styles[size || "medium"]}`}
      href={href}
      target={external ? "_blank" : ""}
      rel={external ? "noreferrer" : ""}
    >
      {children}
    </a>
  ) : (
    <button
      title={title}
      onClick={handleClick}
      className={`${styles.iconButton} ${styles[size || "medium"]}`}
    >
      {children}
    </button>
  );
  return <>{button}</>;
}
