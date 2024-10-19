import React, { ReactNode } from "react";
import styles from "./Button.module.scss";

type ButtonSize = 'small' | 'medium' | 'large';
type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

interface ButtonBaseProps {
  size?: ButtonSize;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  title?: string; // Ensure you have a title prop for accessibility
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
  loading = false,
  disabled = false,
  className = '',
  title = '',
  children,
  ...rest
}) => {
  const baseClassName = styles.button;
  const sizeClassName = styles[size];
  const variantClassName = styles[variant];
  const isLoading = loading ? styles.isLoading : '';
  const isDisabled = disabled ? styles.disabled : '';
  const hasOnlyIcon = React.Children.count(children) === 1 && typeof children === 'object' && !('props' in children && children.props.children);


  const combinedClassName = [
    baseClassName,
    sizeClassName,
    variantClassName,
    isLoading,
    isDisabled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Loop over children and identify if there's an icon (based on type or props)
  // clone the icon and add aria-hidden to it, wrap the rest in span
  // aria-label if only icon is present, and no text
  const ariaProps = hasOnlyIcon ? { 'aria-label': title } : {};
  const content = React.Children.map(children, (child) => {

    return <span>{child}</span>;
  });
  if (as === 'a') {
    const { href, ...anchorRest } = rest as ButtonAsAnchor;
    return (
      <a
        href={href}
        className={combinedClassName}
        title={title}
        {...ariaProps}
        {...anchorRest}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      className={combinedClassName}
      disabled={disabled}
      title={title}
      {...(rest as ButtonAsButton)}
      {...ariaProps}
    >
      {content}
    </button>
  );
};

export default Button;
