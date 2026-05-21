import React from 'react';
import Image from 'next/image';
import './Avatar.css';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name: string;
  size: 'small' | 'medium' | 'large' | 'extra-large';
  priority?: boolean;
}

function initials(name: string) {
  let parts = name.split(' ');
  if (parts.length > 2) {
    parts = parts.slice(0, 2);
  }
  return parts.map((part) => part[0]).join('');
}

const sizeMap = {
  small: { width: 32, height: 32, sizes: '32px' },
  medium: { width: 48, height: 48, sizes: '48px' },
  large: { width: 64, height: 64, sizes: '64px' },
  'extra-large': { width: 128, height: 128, sizes: '128px' },
} as const;

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, name, size, priority = false, className = '', ...rest }, ref) => {
    const displayInitials = name ? initials(name) : '';
    const dimensions = sizeMap[size];

    return (
      <div
        ref={ref}
        data-ds-component="Avatar"
        className={['avatar', size, className].filter(Boolean).join(' ')}
        data-slot="avatar"
        {...rest}
      >
        {src ? (
          <Image
            src={src}
            alt={name}
            width={dimensions.width}
            height={dimensions.height}
            sizes={dimensions.sizes}
            priority={priority}
            className="avatar_image"
            data-slot="avatar-image"
          />
        ) : (
          <span className="avatar_initials" data-slot="avatar-initials">
            {displayInitials}
          </span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };
export default Avatar;
