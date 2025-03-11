"use server";

import { createClient } from "./server";
import { unstable_noStore as noStore } from "next/cache";

export async function checkForAuth() {
  const client = await createClient();
  const {data: {session}, error} = await client.auth.getSession();
  if (error) {
    console.error("Error fetching session:", error);
  }
  if (session) {
    return session;
  } else {
    return noStore;
  }
}
