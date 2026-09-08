import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isAdminUserId } from '@/utils/env';
import {
  maintainContentRelations,
  MaintenanceUnavailable,
} from '@/utils/supabase/contentRelationMaintenance.server';
import { revalidatePublicArticlePaths } from '@/utils/supabase/revalidateContent';

async function run(removeOrphans: boolean) {
  try {
    const client = await createClient();
    const {
      data: { user },
      error,
    } = await client.auth.getUser();
    if (error || !user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdminUserId(user.id))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const data = await maintainContentRelations(removeOrphans);
    if (data.cleanup.removed) revalidatePublicArticlePaths();
    return NextResponse.json(
      {
        success: !data.cleanup.errors.length,
        data,
        statsTiming: 'before-cleanup',
      },
      { status: data.cleanup.errors.length ? 500 : 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof MaintenanceUnavailable
            ? 'Privileged maintenance is not configured'
            : 'Maintenance failed; inspect database availability before retrying',
      },
      { status: error instanceof MaintenanceUnavailable ? 503 : 500 }
    );
  }
}
export const GET = () => run(false);
export const POST = () => run(true);
