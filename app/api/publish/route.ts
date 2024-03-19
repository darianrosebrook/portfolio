import { createClient } from "@/utils/supabase/server";

const POST = async (req: any) => {
  const body = await req.json()
  const supabase = createClient();
  const {data: userData} = await supabase.auth.getUser();
  body.author =  userData.user.id;
  const { data, error } = await supabase
    .from("articles")
    .insert(body);
  return Response.json({ data, error }); 
}
export { POST };
