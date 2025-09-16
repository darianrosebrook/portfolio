/**
 * Alert - Consolidated alert component supporting inline, section, and page levels
 * Replaces both Alert and AlertNotice components
 */
'use client';
import * as React from 'react';
import Button from '../Button';
import { TimesIcon, LocalIcons } from '@/ui/components/Icon/LocalIcons';
import { Intent, DismissibleProps } from '@/types/ui';
import styles from './Alert.module.scss';

export type AlertLevel = 'inline' | 'section' | 'page';

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    DismissibleProps {
  /**
   * Visual intent/severity of the alert
   */
  intent?: Intent;
  /**
   * Display level affecting layout and emphasis
   */
  level?: AlertLevel;
  /**
   * Index for dismissible alerts (used in onDismiss callback)
   */
  index?: number;
}

const Container = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      intent = 'info',
      level = 'section',
      dismissible,
      onDismiss,
      index = 0,
      className = '',
      children,
      ...rest
    },
    ref
  ) => {
    const alertClassName = [
      styles.alert,
      styles[`alert__${level}`],
      styles[`alert__${level}--${intent}`],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} role="alert" className={alertClassName} {...rest}>
        {children}
        {dismissible && onDismiss && (
          <div className={styles['__dismiss']}>
            <Button
              variant="tertiary"
              onClick={onDismiss}
              title="Dismiss this alert"
              data-index={index}
            >
              <TimesIcon aria-hidden={true} />
              <span className="sr-only">Dismiss this alert</span>
            </Button>
          </div>
        )}
      </div>
    );
  }
);
Container.displayName = 'Alert.Container';

const Title = ({ children }: { children: React.ReactNode }) => (
  <h6 className={styles['__title']}>{children}</h6>
);
Title.displayName = 'Alert.Title';

const Body = ({ children }: { children: React.ReactNode }) => (
  <div className={styles['__body']}>{children}</div>
);
Body.displayName = 'Alert.Body';

const Icon = ({ intent }: { intent: Intent }) => {
  const icons = {
    info: 'info-circle' as const,
    success: 'check-circle' as const,
    warning: 'exclamation-triangle' as const,
    danger: 'exclamation-circle' as const,
  };

  const IconComponent = LocalIcons[icons[intent]];

  return (
    <div className={styles['__icon']}>
      <IconComponent aria-hidden={true} />
    </div>
  );
};
Icon.displayName = 'Alert.Icon';

// Compound component pattern
const Alert = Object.assign(Container, {
  Title,
  Body,
  Icon,
});

export { Container, Title, Body, Icon };
export default Alert;
