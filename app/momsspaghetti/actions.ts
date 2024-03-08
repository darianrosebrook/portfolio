"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server";

export async function login() {
  const client = createClient(); 
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL}/auth/callback`,
    },
  });
  if (data.url) { 
    redirect(data.url);
  } else if (error) {
    console.error("Error logging in:", error);
  } else {
    redirect("/");
  }
}
export async function signOut() {
  const client = createClient();
  const { error } = await client.auth.signOut();
  if (error) {
    console.error("Error logging out:", error);
  } else {
    redirect("/");
  }
}
