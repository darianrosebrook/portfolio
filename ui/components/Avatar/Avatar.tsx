import React from 'react';
import Image from 'next/image';
import styles from './Avatar.module.scss';

export interface AvatarProps {
  src?: string;
  name: string;
  size: 'small' | 'medium' | 'large' | 'extra-large';
}

function initials(name: string) {
  let parts = name.split(' ');
  if (parts.length > 2) {
    parts = parts.slice(0, 2);
  }
  return parts.map((part) => part[0]).join('');
}

const Avatar: React.FC<AvatarProps> = ({ src, name, size }) => {
  const displayInitials = name ? initials(name) : '';
  return (
    <div className={`${styles.avatar} ${styles['avatar_' + size]}`}>
      {src ? (
        <Image
          src={src}
          alt={name}
          width={150}
          height={150}
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
