import { describe, expect, it } from 'vitest';
import {
  isDue,
  promotionPayload,
  selectDue,
  type SchedulableRow,
} from '@/utils/schedule/publish';

const NOW = new Date('2026-10-06T09:00:00.000Z');

function row(
  overrides: Partial<SchedulableRow> & Record<string, unknown> = {}
) {
  return { status: 'scheduled', scheduled_at: null, ...overrides };
}

describe('isDue', () => {
  it('is true for a scheduled row whose moment has passed', () => {
    expect(isDue(row({ scheduled_at: '2026-10-06T08:59:59.000Z' }), NOW)).toBe(
      true
    );
  });

  it('is true exactly at the scheduled moment, not only after it', () => {
    expect(isDue(row({ scheduled_at: '2026-10-06T09:00:00.000Z' }), NOW)).toBe(
      true
    );
  });

  it('is false before the moment', () => {
    expect(isDue(row({ scheduled_at: '2026-10-06T09:00:01.000Z' }), NOW)).toBe(
      false
    );
  });

  it('never promotes a draft, published or archived row even with a date', () => {
    for (const status of ['draft', 'published', 'archived']) {
      expect(
        isDue(row({ status, scheduled_at: '2026-01-01T00:00:00.000Z' }), NOW)
      ).toBe(false);
    }
  });

  it('is false when a scheduled row has no date or an unparseable one', () => {
    expect(isDue(row({ scheduled_at: null }), NOW)).toBe(false);
    expect(isDue(row({ scheduled_at: 'not-a-date' }), NOW)).toBe(false);
    expect(
      isDue(row({ status: null, scheduled_at: '2026-01-01T00:00:00Z' }), NOW)
    ).toBe(false);
  });
});

describe('selectDue', () => {
  it('returns only due rows, soonest first', () => {
    const due = selectDue(
      [
        row({ scheduled_at: '2026-10-07T09:00:00.000Z' }), // future
        row({ scheduled_at: '2026-10-05T09:00:00.000Z' }), // due, oldest
        row({ status: 'draft', scheduled_at: '2026-10-01T00:00:00.000Z' }), // not scheduled
        row({ scheduled_at: '2026-10-06T09:00:00.000Z' }), // due now
      ],
      NOW
    );
    expect(due.map((r) => r.scheduled_at)).toEqual([
      '2026-10-05T09:00:00.000Z',
      '2026-10-06T09:00:00.000Z',
    ]);
  });

  it('is empty when nothing is due', () => {
    expect(
      selectDue([row({ scheduled_at: '2027-01-01T00:00:00.000Z' })], NOW)
    ).toEqual([]);
  });
});

describe('promotionPayload', () => {
  it('promotes working fields over canonical ones', () => {
    const payload = promotionPayload(
      row({
        scheduled_at: '2026-10-06T09:00:00.000Z',
        headline: 'Old headline',
        workingheadline: 'New headline',
        articleBody: { old: true },
        workingbody: { new: true },
        workingdescription: 'Working description',
      })
    );
    expect(payload.headline).toBe('New headline');
    expect(payload.articleBody).toEqual({ new: true });
    expect(payload.description).toBe('Working description');
  });

  it('dates the piece from the scheduled moment, not from the run', () => {
    const payload = promotionPayload(
      row({ scheduled_at: '2026-10-06T09:00:00.000Z' })
    );
    expect(payload.published_at).toBe('2026-10-06T09:00:00.000Z');
    expect(payload.status).toBe('published');
    expect(payload.is_dirty).toBe(false);
  });

  it('leaves canonical fields alone when there is no working copy', () => {
    const payload = promotionPayload(
      row({ scheduled_at: '2026-10-06T09:00:00.000Z', headline: 'Keep me' })
    );
    expect(payload).not.toHaveProperty('headline');
  });

  it('does not treat an empty working string as an override', () => {
    const payload = promotionPayload(
      row({
        scheduled_at: '2026-10-06T09:00:00.000Z',
        headline: 'Keep me',
        workingheadline: null,
      })
    );
    expect(payload).not.toHaveProperty('headline');
  });
});
