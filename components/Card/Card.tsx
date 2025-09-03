import React, { useMemo, forwardRef } from 'react';
import styles from './Card.module.scss';
import {
  CardProps,
  CardTheme,
  CardHeaderProps,
  CardMediaProps,
  CardContentProps,
  CardActionsProps,
  CardFooterProps,
  DEFAULT_CARD_TOKENS,
} from './Card.types';
import {
  mergeTokenSources,
  tokensToCSSProperties,
  safeTokenValue,
  TokenSource,
  TokenValue,
} from '@/utils/designTokens';
import defaultTokenConfig from './Card.tokens.json';

function useCardTokens(theme?: CardTheme) {
  return useMemo(() => {
    const sources: TokenSource[] = [{ type: 'json', data: defaultTokenConfig }];
    if (theme?.tokenConfig)
      sources.push({ type: 'json', data: theme.tokenConfig });
    if (theme?.tokens) {
      const inline: Record<string, TokenValue> = {};
      Object.entries(theme.tokens).forEach(([k, v]) => {
        inline[`card-${k}`] = v;
      });
      sources.push({ type: 'inline', tokens: inline });
    }
    const resolved = mergeTokenSources(sources, {
      fallbacks: (() => {
        const fb: Record<string, TokenValue> = {};
        Object.entries(DEFAULT_CARD_TOKENS).forEach(([k, v]) => {
          fb[`card-${k}`] = v;
        });
        return fb;
      })(),
    });
    const cssProperties = tokensToCSSProperties(resolved, 'card');
    if (theme?.cssProperties) Object.assign(cssProperties, theme.cssProperties);
    return { tokens: resolved, cssProperties };
  }, [theme]);
}

const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  actions,
  avatar,
  children,
  className = '',
}) => {
  const headerClasses = [styles.cardHeader, className].filter(Boolean).join(' ');

  return (
    <div className={headerClasses}>
      {avatar && <div className={styles.cardAvatar}>{avatar}</div>}
      
      <div className={styles.cardHeaderContent}>
        {title && <h3 className={styles.cardTitle}>{title}</h3>}
        {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
        {children}
      </div>

      {actions && <div className={styles.cardActions}>{actions}</div>}
    </div>
  );
};

const CardMedia: React.FC<CardMediaProps> = ({
  src,
  alt = '',
  aspectRatio,
  children,
  className = '',
}) => {
  const mediaClasses = [styles.cardMedia, className].filter(Boolean).join(' ');
  
  const mediaStyle = aspectRatio ? { aspectRatio } : undefined;

  return (
    <div className={mediaClasses} style={mediaStyle}>
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        children
      )}
    </div>
  );
};

const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
}) => {
  const contentClasses = [styles.cardContent, className].filter(Boolean).join(' ');

  return <div className={contentClasses}>{children}</div>;
};

const CardActions: React.FC<CardActionsProps> = ({
  children,
  alignment = 'right',
  className = '',
}) => {
  const safeAlignment = safeTokenValue(alignment, 'right', (v) =>
    ['left', 'center', 'right', 'space-between'].includes(v as string)
  ) as string;

  const alignmentClass = safeAlignment === 'space-between' 
    ? 'spaceBetween' 
    : safeAlignment;

  const actionsClasses = [
    styles.cardActionsFooter,
    styles[`cardActionsFooter--${alignmentClass}`] || '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={actionsClasses}>{children}</div>;
};

const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
}) => {
  const footerClasses = [styles.cardFooter, className].filter(Boolean).join(' ');

  return <div className={footerClasses}>{children}</div>;
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      size = 'medium',
      orientation = 'vertical',
      interactive = false,
      disabled = false,
      theme,
      children,
      className = '',
      onClick,
      onKeyDown,
      ...rest
    },
    ref
  ) => {
    const { cssProperties } = useCardTokens(theme);

    const safeVariant = safeTokenValue(variant, 'default', (v) =>
      ['default', 'outlined', 'elevated', 'filled'].includes(v as string)
    ) as string;
    const safeSize = safeTokenValue(size, 'medium', (v) =>
      ['small', 'medium', 'large'].includes(v as string)
    ) as string;
    const safeOrientation = safeTokenValue(orientation, 'vertical', (v) =>
      ['vertical', 'horizontal'].includes(v as string)
    ) as string;

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (interactive && !disabled && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onClick?.(event as any);
      }
      onKeyDown?.(event);
    };

    const cardClasses = [
      styles.card,
      styles[`card--${safeVariant}`] || '',
      styles[`card--${safeSize}`] || '',
      styles[`card--${safeOrientation}`] || '',
      interactive ? styles['card--interactive'] : '',
      disabled ? styles['card--disabled'] : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const cardProps = {
      ref,
      className: cardClasses,
      style: cssProperties,
      onClick: interactive && !disabled ? onClick : undefined,
      onKeyDown: interactive && !disabled ? handleKeyDown : undefined,
      tabIndex: interactive && !disabled ? 0 : undefined,
      role: interactive ? 'button' : undefined,
      'aria-disabled': disabled,
      ...rest,
    };

    return <div {...cardProps}>{children}</div>;
  }
);

Card.displayName = 'Card';

// Sub-component exports
Card.Header = CardHeader;
Card.Media = CardMedia;
Card.Content = CardContent;
Card.Actions = CardActions;
Card.Footer = CardFooter;

export default Card;
export type { CardProps, CardTheme } from './Card.types';
