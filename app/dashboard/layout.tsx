import { redirect } from "next/navigation"; 
import styles from "./page.module.css";

import { createClient } from "@/utils/supabase/server";

export default async function PrivateRoute({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/");
  }
  
  return (
    <div className={styles.page}>
      {children}
    </div>
  )
}
