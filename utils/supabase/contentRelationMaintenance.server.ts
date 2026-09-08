import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/utils/env';

export class MaintenanceUnavailable extends Error {}

function privilegedClient(): SupabaseClient {
  if (typeof window !== 'undefined')
    throw new MaintenanceUnavailable('Server only');
  const key =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  let privileged = key?.startsWith('sb_secret_') ?? false;
  if (key && !privileged) {
    try {
      privileged =
        JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString())
          .role === 'service_role';
    } catch {
      /* Invalid credentials never permit maintenance. */
    }
  }
  if (!key || !privileged)
    throw new MaintenanceUnavailable(
      'Privileged maintenance credentials are not configured'
    );
  // No user cookies: RLS-hidden drafts must be visible to existence checks.
  // Supabase verifies the privileged credential on every read.
  return createClient(env.nextPublicSupabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

type Row = { id: number; [key: string]: unknown };
async function readAll(
  client: SupabaseClient,
  table: string,
  fields: string
): Promise<Row[]> {
  const rows: Row[] = [];
  let cursor: number | null = null;
  for (;;) {
    let query = client
      .from(table)
      .select(fields)
      .order('id', { ascending: true })
      .limit(500);
    if (cursor !== null) query = query.gt('id', cursor);
    const { data, error } = await query;
    if (error || !Array.isArray(data))
      throw new Error('Maintenance read failed');
    if (data.length === 0) return rows;
    for (const row of data as unknown as Row[]) {
      if (
        !Number.isSafeInteger(row.id) ||
        (cursor !== null && row.id <= cursor)
      )
        throw new Error('Incomplete maintenance read');
      cursor = row.id;
      rows.push(row);
    }
    // Continue until empty, even when the server caps pages below our limit.
  }
}

/** Confine destructive maintenance to a privileged, cookieless client. */
export async function maintainContentRelations(removeOrphans: boolean) {
  const client = privilegedClient();
  const edges = await readAll(
    client,
    'content_relations',
    'id,source_id,source_type,target_id,target_type,relationship_type'
  );
  const stats = {
    totalRelations: edges.length,
    relationsByType: {} as Record<string, number>,
  };
  for (const edge of edges) {
    const type =
      typeof edge.relationship_type === 'string'
        ? edge.relationship_type
        : 'related';
    stats.relationsByType[type] = (stats.relationsByType[type] ?? 0) + 1;
  }
  const cleanup = { checked: edges.length, removed: 0, errors: [] as string[] };
  if (!removeOrphans || !edges.length) return { cleanup, stats };
  // Finish all existence reads before deleting. Failed reads never mean absent.
  const articles = new Set(
    (await readAll(client, 'articles', 'id')).map((row) => row.id)
  );
  const studies = new Set(
    (await readAll(client, 'case_studies', 'id')).map((row) => row.id)
  );
  const exists = (type: unknown, id: unknown) => {
    if (
      !Number.isSafeInteger(id) ||
      (type !== 'article' && type !== 'case-study')
    )
      throw new Error('Unrecognized relation endpoint');
    return (type === 'article' ? articles : studies).has(id as number);
  };
  const orphans = edges.filter((edge) => {
    const source = exists(edge.source_type, edge.source_id);
    const target = exists(edge.target_type, edge.target_id);
    return !source || !target;
  });
  for (const edge of orphans) {
    const { data, error } = await client
      .from('content_relations')
      .delete()
      .eq('id', edge.id)
      .eq('source_id', edge.source_id)
      .eq('source_type', edge.source_type)
      .eq('target_id', edge.target_id)
      .eq('target_type', edge.target_type)
      .select('id');
    if (error || !Array.isArray(data)) {
      cleanup.errors.push('A relation could not be removed');
      break;
    }
    cleanup.removed += data.length;
  }
  // These stats describe the observed pre-cleanup snapshot, not a fresh read.
  return { cleanup, stats };
}
