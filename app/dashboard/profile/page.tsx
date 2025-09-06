import { createClient } from '@/utils/supabase/server';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <div>
      <h2>Profile</h2>
      {user ? <pre>{JSON.stringify(user, null, 2)}</pre> : <p>Not signed in</p>}
    </div>
  );
}
