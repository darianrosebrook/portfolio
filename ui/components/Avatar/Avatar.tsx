import React from 'react';
import Image from 'next/image';
import styles from './Avatar.module.scss';

export interface AvatarProps {
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

const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size,
  priority = false,
}) => {
  const displayInitials = name ? initials(name) : '';
  const dimensions = sizeMap[size];

  return (
    <div className={`${styles.avatar} ${styles['avatar_' + size]}`}>
      {src ? (
        <Image
          src={src}
          alt={name}
          width={dimensions.width}
          height={dimensions.height}
          sizes={dimensions.sizes}
          priority={priority}
          className={styles.avatar_image}
        />
      ) : (
        <span>{displayInitials}</span>
      )}
    </div>
  );
};

export { Avatar };
export default Avatar;
