import { Profile } from '@/types';
import Avatar from '../Avatar';
import Link from 'next/link';
import styles from './styles.module.css';
const ProfileFlag = ({ profile }: { profile: Profile }) => {
  return (
    <div className={styles.profileFlag}>
      <Link href={`/`}>
        <Avatar
          size="medium"
          name={profile.full_name}
          src={profile.avatar_url}
        />
        <small>{profile.full_name}</small>
      </Link>
    </div>
  );
};

export default ProfileFlag;
