"use server";

import { revalidatePath } from "next/cache";
import { RedirectType, redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    "http://localhost:3000/"; 
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  return url;
};
export async function signOut() {
  const client = createClient();
  const { error } = await client.auth.signOut();
  if (error) {
    console.error("Error logging out:", error);
  } else {
    redirect("/");
  }
}
export async function login(formData: FormData) { 
  const supabase = createClient(); 

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getURL()}/auth/callback`, 
    },
  });

  if (data.url) { 
    console.log('data.url', data)  
    redirect(data.url, RedirectType.replace);
  } else if (error) {
    console.error("Error logging in:", error);
  } 
 
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}
