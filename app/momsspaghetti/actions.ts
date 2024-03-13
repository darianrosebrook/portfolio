"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server";
const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/'
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`
  // Make sure to include a trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`
  return url
}
export async function login() {
  const client = createClient(); 
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getURL(),
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
