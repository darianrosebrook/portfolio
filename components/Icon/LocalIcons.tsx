/**
 * Local SVG icon components to replace FontAwesome external script
 * These are optimized, lightweight alternatives to external font loading
 */

import React from 'react';

interface IconProps {
  className?: string;
  'aria-hidden'?: boolean;
  size?: number;
}

// Core icons used throughout the app
export const TimesIcon: React.FC<IconProps> = ({
  className = '',
  'aria-hidden': ariaHidden = true,
  size = 16,
}) => (
  <svg
    className={className}
    aria-hidden={ariaHidden}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({
  className = '',
  'aria-hidden': ariaHidden = true,
  size = 16,
}) => (
  <svg
    className={className}
    aria-hidden={ariaHidden}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

export const LinkIcon: React.FC<IconProps> = ({
  className = '',
  'aria-hidden': ariaHidden = true,
  size = 16,
}) => (
  <svg
    className={className}
    aria-hidden={ariaHidden}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
  </svg>
);

export const InfoCircleIcon: React.FC<IconProps> = ({
  className = '',
  'aria-hidden': ariaHidden = true,
  size = 16,
}) => (
  <svg
    className={className}
    aria-hidden={ariaHidden}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
  </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({
  className = '',
  'aria-hidden': ariaHidden = true,
  size = 16,
}) => (
  <svg
    className={className}
    aria-hidden={ariaHidden}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

export const ExclamationTriangleIcon: React.FC<IconProps> = ({
  className = '',
  'aria-hidden': ariaHidden = true,
  size = 16,
}) => (
  <svg
    className={className}
    aria-hidden={ariaHidden}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);

export const ExclamationCircleIcon: React.FC<IconProps> = ({
  className = '',
  'aria-hidden': ariaHidden = true,
  size = 16,
}) => (
  <svg
    className={className}
    aria-hidden={ariaHidden}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);

// Icon mapping for easy replacement
export const LocalIcons = {
  times: TimesIcon,
  check: CheckIcon,
  link: LinkIcon,
  'info-circle': InfoCircleIcon,
  'check-circle': CheckCircleIcon,
  'exclamation-triangle': ExclamationTriangleIcon,
  'exclamation-circle': ExclamationCircleIcon,
} as const;

// Helper component that mimics FontAwesome's fa classes
interface FAIconProps {
  icon: keyof typeof LocalIcons;
  className?: string;
  'aria-hidden'?: boolean;
  size?: number;
}

export const FAIcon: React.FC<FAIconProps> = ({ icon, ...props }) => {
  const IconComponent = LocalIcons[icon];
  return <IconComponent {...props} />;
};
