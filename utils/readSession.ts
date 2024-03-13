"use server";

import { createClient } from "./supabase/server";
import { unstable_noStore as noStore } from "next/cache";

export async function checkForAuth() {
  const client = createClient();
  const {data: {session}, error} = await client.auth.getSession();
  if (session) {
    return session;
  } else {
    return noStore;
  }
  
}
