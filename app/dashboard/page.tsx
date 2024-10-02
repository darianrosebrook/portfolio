import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export default async function PrivatePage() {


  return (
    <section>
      <h1>Private Page</h1>
    </section>
  )
}
