import { redirect } from "next/navigation";
import AccountForm from "./account-form";
import styles from "./page.module.css";

import { createClient } from "@/utils/supabase/server";

export default async function PrivatePage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/");
  }

  return (
    <>
      <p>Hello {data.user.email}</p>
      <AccountForm user={data.user} />
    </>
  );
}
