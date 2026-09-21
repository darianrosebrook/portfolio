/**
 * Scheduled publishing, as pure functions.
 *
 * The cron route is thin glue over these: what counts as due, in what order,
 * and what a promotion writes are decided here so they can be tested without a
 * database, a session, or a clock.
 *
 * A scheduled item is not a draft. It carries a real `scheduled` status and a
 * `scheduled_at`, and it publishes itself at that moment — which is why the
 * promotion takes `published_at` from `scheduled_at` rather than from the time
 * the job happened to run.
 */

export interface SchedulableRow {
  status: string | null;
  scheduled_at: string | null;
}

export type PromotionPayload = Record<string, unknown>;

/**
 * Working field -> canonical field. A promotion copies the working draft over
 * the published copy, which is what the manual publish path does.
 */
const FIELD_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['workingbody', 'articleBody'],
  ['workingheadline', 'headline'],
  ['workingdescription', 'description'],
  ['workingimage', 'image'],
  ['workingkeywords', 'keywords'],
  ['workingarticlesection', 'articleSection'],
];

/** True when the row is scheduled and its moment has arrived. */
export function isDue(row: SchedulableRow, now: Date): boolean {
  if (row.status !== 'scheduled') return false;
  if (!row.scheduled_at) return false;
  const at = Date.parse(row.scheduled_at);
  return Number.isFinite(at) && at <= now.getTime();
}

/** Due rows, soonest first. Never returns a row that is not due. */
export function selectDue<T extends SchedulableRow>(
  rows: readonly T[],
  now: Date
): T[] {
  return rows
    .filter((row) => isDue(row, now))
    .slice()
    .sort(
      (a, b) =>
        Date.parse(a.scheduled_at ?? '') - Date.parse(b.scheduled_at ?? '')
    );
}

/**
 * The update a promotion writes. `published_at` is the scheduled moment, not
 * `now`, so a piece is dated from when it was promised rather than from when
 * the job ran. `scheduled_at` is left in place as the record of that promise.
 */
export function promotionPayload(
  row: SchedulableRow & Record<string, unknown>
): PromotionPayload {
  const payload: PromotionPayload = {
    status: 'published',
    published_at: row.scheduled_at,
    is_dirty: false,
  };

  for (const [working, canonical] of FIELD_PAIRS) {
    const value = row[working];
    if (value !== undefined && value !== null) payload[canonical] = value;
  }

  return payload;
}
