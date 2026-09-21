import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isAdminUserId } from '@/utils/env';
import {
  promotionPayload,
  selectDue,
  type SchedulableRow,
} from '@/utils/schedule/publish';
import { extractMetadata } from '@/utils/metadata';
import { revalidatePublicArticlePaths } from '@/utils/supabase/revalidateContent';
import { revalidatePublicCaseStudyPaths } from '@/utils/supabase/revalidateContent';
import type { JSONContent } from '@tiptap/react';

/**
 * Publishes content whose scheduled moment has arrived.
 *
 * Called by a scheduler with `Authorization: Bearer $CRON_SECRET` (Vercel Cron
 * does this automatically when the variable is set), or by an admin session so
 * it can be triggered by hand. With neither, it refuses before reading content.
 *
 * The decision-making lives in utils/schedule/publish.ts; this file is the
 * database and cache glue.
 */

const SCHEDULED_SELECT = [
  'id',
  'slug',
  'status',
  'scheduled_at',
  'wordCount',
  'articleBody',
  'workingbody',
  'workingheadline',
  'workingdescription',
  'workingimage',
  'workingkeywords',
  'workingarticlesection',
].join(', ');

const TABLES = [
  { table: 'articles', revalidate: revalidatePublicArticlePaths },
  { table: 'case_studies', revalidate: revalidatePublicCaseStudyPaths },
] as const;

type Row = SchedulableRow & Record<string, unknown>;

async function authorize(
  request: Request,
  client: Awaited<ReturnType<typeof createClient>>
): Promise<'ok' | 'unauthorized' | 'forbidden'> {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') === `Bearer ${secret}`) {
    return 'ok';
  }

  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) return 'unauthorized';
  return isAdminUserId(user.id) ? 'ok' : 'forbidden';
}

async function run(request: Request): Promise<Response> {
  const client = await createClient();

  const authorization = await authorize(request, client);
  if (authorization === 'unauthorized') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (authorization === 'forbidden') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const now = new Date();
  const published: { table: string; slug: string; published_at: unknown }[] =
    [];
  const failures: { table: string; slug: string; message: string }[] = [];

  for (const { table, revalidate } of TABLES) {
    const { data, error } = await client
      .from(table)
      .select(SCHEDULED_SELECT)
      .eq('status', 'scheduled')
      .lte('scheduled_at', now.toISOString())
      .order('scheduled_at', { ascending: true });

    if (error) {
      // 22P02 = the enum holds no 'scheduled' member, i.e. the migration that
      // enables this feature has not been applied. Fail closed and say so.
      const notEnabled = error.code === '22P02';
      return NextResponse.json(
        {
          error: notEnabled
            ? 'Scheduling is not enabled in this database: article_status has no scheduled member.'
            : 'Could not read scheduled content.',
          code: error.code ?? null,
        },
        { status: notEnabled ? 503 : 500 }
      );
    }

    // The select list is assembled at runtime, so the client cannot infer the
    // row shape; route it through unknown rather than pretending it overlaps.
    for (const row of selectDue((data ?? []) as unknown as Row[], now)) {
      const payload = promotionPayload(row);
      const body = (payload.articleBody ?? row.articleBody) as
        JSONContent | undefined;
      const wordCount = body
        ? extractMetadata(body).wordCount
        : ((row.wordCount as number | null) ?? null);

      const { error: updateError } = await client
        .from(table)
        .update({ ...payload, wordCount })
        .eq('id', row.id as number);

      if (updateError) {
        failures.push({
          table,
          slug: String(row.slug ?? ''),
          message: updateError.message,
        });
        continue;
      }

      published.push({
        table,
        slug: String(row.slug ?? ''),
        published_at: payload.published_at,
      });
    }

    if (published.some((entry) => entry.table === table)) revalidate();
  }

  return NextResponse.json(
    { count: published.length, published, failures },
    { status: failures.length > 0 ? 500 : 200 }
  );
}

export const GET = run;
export const POST = run;
