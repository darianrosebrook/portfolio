'use client'
import React from "react";
import styles from "./Button.module.scss";

type ButtonSize = 'small' | 'medium' | 'large';
type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

interface ButtonBaseProps {
  size?: ButtonSize;
  variant?: ButtonVariant;
  isLoading?: boolean;
  className?: string;
  icon?: React.ReactElement;
  iconOnly?: boolean;
}

interface ButtonAsButton extends ButtonBaseProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  as?: 'button';
}

interface ButtonAsAnchor extends ButtonBaseProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'className'> {
  as: 'a';
  href: string;
}

type ButtonProps = ButtonAsButton | ButtonAsAnchor;

const Button: React.FC<ButtonProps> = ({
  as = 'button',
  size = 'medium',
  variant = 'primary',
  isLoading = false,
  className = '',
  children,
  icon,
  iconOnly = false,
  ...rest
}) => {
  const baseClassName = styles.button;
  const sizeClassName = styles[size];
  const variantClassName = styles[variant];

  const combinedClassName = `${baseClassName} ${sizeClassName} ${variantClassName} ${className}`.trim();

  const content = (
    <>
      {icon && React.cloneElement(icon, { 'aria-hidden': 'true' })}
      {!iconOnly && <span>{isLoading ? 'Loading...' : children}</span>}
    </>
  );

  if (as === 'a') {
    const { href, ...anchorRest } = rest as ButtonAsAnchor;
    return (
      <a
        href={href}
        className={combinedClassName}
        {...anchorRest}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      className={combinedClassName}
      disabled={isLoading}
      {...(rest as ButtonAsButton)}
    >
      {content}
    </button>
  );
};

export default Button;