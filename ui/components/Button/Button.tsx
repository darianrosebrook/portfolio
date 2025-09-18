import React, { useMemo } from 'react';
import styles from './Button.module.scss';

export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

interface ButtonBaseProps {
  size?: ButtonSize;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  title?: string; // Ensure you have a title prop for accessibility
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaPressed?: boolean;
  role?: React.AriaRole;
}

interface ButtonAsButton
  extends ButtonBaseProps,
    Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      'className' | 'type' | 'onClick' | 'disabled'
    > {
  as?: 'button';
  type?: 'button' | 'submit' | 'reset';
  form?: string;
  autoFocus?: boolean;
  tabIndex?: number;
  'data-testid'?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

interface ButtonAsAnchor
  extends ButtonBaseProps,
    Omit<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      'className' | 'href' | 'onClick'
    > {
  as: 'a';
  href: string;
  tabIndex?: number;
  'data-testid'?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

const Button: React.FC<ButtonProps> = ({
  as = 'button',
  size = 'medium',
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  title = '',
  ariaLabel,
  ariaExpanded,
  ariaPressed,
  role,
  children,
  ...rest
}) => {
  const baseClassName = styles.button;
  const sizeClassName = styles[size];
  const variantClassName = styles[variant];
  const isLoadingClassName = loading ? styles.isLoading : '';
  const isDisabledClassName = disabled ? styles.disabled : '';

  const childCount = React.Children.count(children);
  const isSingleChild = childCount === 1;
  const hasOnlyIcon =
    isSingleChild &&
    React.isValidElement(children) &&
    (children.type === 'svg' ||
      (children.props &&
        ((children.props as any)['aria-label'] ||
          (children.props as any)['data-icon'])));

  const combinedClassName = useMemo(
    () =>
      [
        baseClassName,
        sizeClassName,
        variantClassName,
        isLoadingClassName,
        isDisabledClassName,
        className,
      ]
        .filter(Boolean)
        .join(' '),
    [
      baseClassName,
      sizeClassName,
      variantClassName,
      isLoadingClassName,
      isDisabledClassName,
      className,
    ]
  );

  const ariaProps = {
    ...(hasOnlyIcon && { 'aria-label': title || ariaLabel }),
    ...(ariaExpanded !== undefined && { 'aria-expanded': ariaExpanded }),
    ...(ariaPressed !== undefined && { 'aria-pressed': ariaPressed }),
    ...(role && { role }),
  } as const;

  const renderChildren = () => {
    if (loading) {
      return (
        <>
          <span className={styles.spinner} aria-hidden="true" />
          {children ? (
            <span className={styles.loadingText}>{children}</span>
          ) : null}
        </>
      );
    }

    if (children == null) return null;
    if (typeof children === 'string' || typeof children === 'number') {
      return <span>{children}</span>;
    }
    return children;
  };
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
        {renderChildren()}
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
      {renderChildren()}
    </button>
  );
};

export default React.memo(Button);
