import { createClient } from "@/utils/supabase/server";

const POST = async (req: any) => {
  const body = await req.json();
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  body.author = userData.user.id;
  const { data, error } = await supabase.from("articles").insert(body);
  return Response.json({ data, error });
};
const GET = async (req: any) => {
  const supabase = createClient();
  const { data, error } = await supabase.from("articles").select("*");
  return Response.json({ data, error });
};
const PUT = async (req: any) => {
  const body = await req.json();
  const supabase = createClient();
  const { author, ...rest } = body;
  const { data, error } = await supabase
    .from("articles")
    .update(rest)
    .eq("id", body.id);
  return Response.json({ data, error });
};
export { POST, GET, PUT };
