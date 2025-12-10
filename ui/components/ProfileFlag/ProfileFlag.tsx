/**
 * @deprecated This is a product-specific component that should be moved to app-level.
 *
 * ProfileFlag is too specific to the articles/profile feature to belong in the
 * design system. Consider moving to:
 * - app/_components/ProfileFlag.tsx, or
 * - app/articles/_components/ProfileFlag.tsx
 *
 * Design system components should be reusable across different product contexts.
 */
import React from 'react';
import { Profile } from '@/types';
import Avatar from '../Avatar';
import Link from 'next/link';
import styles from './ProfileFlag.module.scss';

/** @deprecated Move to app-level components */
export interface ProfileFlagProps {
  profile: Profile | null;
}

const ProfileFlag: React.FC<ProfileFlagProps> = ({ profile }) => {
  if (!profile) {
    return null;
  }
  const { full_name, avatar_url, username } = profile;
  const insert = {
    name: full_name || 'Error',
    src: avatar_url || null,
    username: username || '404',
  };
  return (
    <div className={styles.profileFlag}>
      <Link href={`/${insert.username}`}>
        <Avatar
          size="medium"
          name={insert.name}
          src={insert.src || undefined}
        />
        <small>{insert.name}</small>
      </Link>
    </div>
  );
};

export default ProfileFlag;
