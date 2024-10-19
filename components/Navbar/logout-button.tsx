import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import Button from "../Button";

export default function LogoutButton() {
  const client = createClient(); 
  const signOut = async () => { 

    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect("/ha");
  };
  return (
    <form action={signOut}>
      <Button type="submit" variant="tertiary">
        Logout
      </Button>
    </form>
  );
}
