import { getCurrentUserProfile } from '@/utils/supabase/profile';
import { createClient } from '@/utils/supabase/server';
import Avatar from '@/ui/Avatar';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = await getCurrentUserProfile();

  if (!user) {
    return (
      <div>
        <h2>Profile</h2>
        <p>Not signed in</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Profile</h2>

      {profile ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            maxWidth: '600px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Avatar
              src={profile.avatar_url || undefined}
              name={profile.full_name}
              size="large"
            />
            <div>
              <h3>{profile.full_name}</h3>
              <p>@{profile.username}</p>
              {profile.occupation && <p>{profile.occupation}</p>}
            </div>
          </div>

          {profile.bio && (
            <div>
              <h4>Bio</h4>
              <p>{profile.bio}</p>
            </div>
          )}

          <div>
            <h4>Account Details</h4>
            <ul>
              <li>
                <strong>Email:</strong> {user.email}
              </li>
              <li>
                <strong>Account Status:</strong> {profile.account_status}
              </li>
              <li>
                <strong>Privacy:</strong> {profile.privacy}
              </li>
              <li>
                <strong>Created:</strong>{' '}
                {new Date(profile.created_at).toLocaleDateString()}
              </li>
              {profile.updated_at && (
                <li>
                  <strong>Updated:</strong>{' '}
                  {new Date(profile.updated_at).toLocaleDateString()}
                </li>
              )}
            </ul>
          </div>

          {profile.social_media && profile.social_media.length > 0 && (
            <div>
              <h4>Social Media</h4>
              <ul>
                {profile.social_media.map((social, index) => (
                  <li key={index}>{social}</li>
                ))}
              </ul>
            </div>
          )}

          <details>
            <summary>Raw Profile Data</summary>
            <pre style={{ fontSize: '0.8rem', overflow: 'auto' }}>
              {JSON.stringify(profile, null, 2)}
            </pre>
          </details>

          <details>
            <summary>Raw User Data</summary>
            <pre style={{ fontSize: '0.8rem', overflow: 'auto' }}>
              {JSON.stringify(user, null, 2)}
            </pre>
          </details>
        </div>
      ) : (
        <div>
          <p>Profile not found. You may need to create a profile first.</p>
          <details>
            <summary>Raw User Data</summary>
            <pre style={{ fontSize: '0.8rem', overflow: 'auto' }}>
              {JSON.stringify(user, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
