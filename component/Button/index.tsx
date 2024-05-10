"use client";
import { forwardRef } from "react";
import styles from "./Button.module.css";
import React from "react";
interface ButtonProps {
  size?: "small" | "medium" | "large";
  variant: "primary" | "secondary" | "tertiary";
  children: React.ReactNode;
  href?: string | null;
  external?: boolean;
  title?: string;
  handleClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
export default function Button({
  size,
  children,
  href = null,
  external = false,
  title,
  variant = "primary",
  handleClick,
  ...props
}: ButtonProps) {
  // If there are multiple children, wrap them in a span, workaround for not being able to select text node with css
  const childrenArray = React.Children.toArray(children);
  const childrenCount = childrenArray.length;
  if (childrenCount > 1) {
    childrenArray[1] = <span>{childrenArray[1]}</span>;
  }
  children = childrenArray;
  const button = href ? (
    <a
      title={title}
      className={`${styles.button} ${styles[size || "medium"]} ${
        styles[variant]
      }`}
      href={href}
      target={external ? "_blank" : ""}
      rel={external ? "noreferrer" : ""}
      {...props}
    >
      {children}
    </a>
  ) : (
    <button
      title={title}
      onClick={handleClick}
      className={`${styles.button} ${styles[size || "medium"]} ${
        styles[variant]
      }`}
      {...props}
    >
      {children}
    </button>
  );
  return <>{button}</>;
}
