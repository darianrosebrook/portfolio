import { createClient } from "@/utils/supabase/client";
import { login } from "app/ha/actions";

export default function LoginButton(props: { nextUrl?: string }) {
  const client = createClient();
 

  return (
    <form>
      <button formAction={login}>Login</button>
    </form>
  );
}
