import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";

export default function LogoutButton() {
  const client = createClient(); 
  const signOut = async () => { 

    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect("/momsspaghetti");
  };
  return (
    <form action={signOut}>
      <button className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
        Logout
      </button>
    </form>
  );
}
