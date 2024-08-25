'use client'
import React from "react";
import styles from "./Button.module.scss";

interface ButtonProps {
  size?: "small" | "medium" | "large";
  variant?: "primary" | "secondary" | "tertiary";
  children: React.ReactNode;
  href?: string | null;
  external?: boolean;
  title?: string;
  handleClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button: React.FC<ButtonProps> = ({
  size = "medium",
  variant = "primary",
  children,
  href = null,
  external = false,
  title,
  handleClick,
  ...props
}) => {
  const childrenArray = React.Children.toArray(children);
  const isSvgOnly = childrenArray.length === 1 && React.isValidElement(childrenArray[0]) && childrenArray[0].type === 'svg';

  const className = `${styles.button} ${styles[size]} ${styles[variant]}${isSvgOnly ? ` ${styles.icon}` : ""}`;

  const content = isSvgOnly ? children : (
    <>
      {childrenArray[0]}
      {childrenArray.length > 1 && <span>{childrenArray.slice(1)}</span>}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        title={title}
        className={className}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      title={title}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;