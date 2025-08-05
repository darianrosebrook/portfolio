import { Profile } from '@/types';
import Avatar from '../Avatar';
import Link from 'next/link';
import styles from './styles.module.css';
const ProfileFlag = ({ profile }: { profile: Profile | null }) => {
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
