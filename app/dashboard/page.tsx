import { redirect } from "next/navigation";
import AccountForm from "./account-form"; 

import { createClient } from "@/utils/supabase/server";

export default async function PrivatePage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser(); 

  return (
    <>
      <p>Hello {data.user.email}</p>
      <AccountForm user={data.user} />
    </>
  );
}
