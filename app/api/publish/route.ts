import { createClient } from '@/utils/supabase/server';

const POST = async (req: Request) => {
  const body = await req.json();
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  body.author = userData.user.id;
  const { data, error } = await supabase.from('articles').insert(body);
  return Response.json({ data, error });
};
const GET = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('articles').select('*');
  return Response.json({ data, error });
};
const PUT = async (req: Request) => {
  const body = await req.json();
  const supabase = await createClient();
  const { ...rest } = body;
  const { data, error } = await supabase
    .from('articles')
    .update(rest)
    .eq('id', body.id);
  return Response.json({ data, error });
};
export { POST, GET, PUT };
