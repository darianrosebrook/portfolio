import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { render, within } from '@testing-library/react';
import { AnatomyTable } from '@/app/blueprints/component-standards/_components/AnatomyTable';
import { getAnatomyData } from '@/app/blueprints/component-standards/_lib/generateAnatomy';
import type { ComponentItem } from '@/app/blueprints/component-standards/_lib/componentsData';

/**
 * Render-level evidence for the filter removal: mounts the real AnatomyTable
 * with anatomy derived from the real on-disk contracts, and confirms the rows
 * the old substring filter used to drop now appear as actual table rows with
 * the expected Type-column label. jsdom, not pixels — the live-page screenshot
 * is blocked in this sandbox (no port bind / no Playwright browser).
 */

function item(component: string): ComponentItem {
  return {
    component,
    id: component.toLowerCase(),
    slug: component.toLowerCase(),
    layer: 'primitives',
    alternativeNames: [],
    normalizedAliases: [],
    category: '',
    description: '',
    a11y: { pitfalls: [] },
    status: 'Built',
    paths: { component: `ui/components/${component}` },
  };
}

/** rowheader cells hold the part name (prefixed by a decorative glyph). */
function renderedPartNames(region: HTMLElement): string[] {
  return within(region)
    .getAllByRole('rowheader')
    .map((el) => el.textContent ?? '');
}

describe('AnatomyTable renders real contract anatomy after filter removal', () => {
  it('Tabs: renders all authored rows, including the state-decorated ones', () => {
    const parts = getAnatomyData(item('Tabs'));
    expect(parts).not.toBeNull();

    const { getByRole } = render(
      <AnatomyTable parts={parts!} componentName="Tabs" />
    );
    const region = getByRole('region', { name: 'Tabs anatomy' });
    const names = renderedPartNames(region);

    // one rendered rowheader per authored anatomy entry — nothing dropped
    expect(names).toHaveLength(parts!.length);

    for (const previouslyDropped of [
      'tabActive',
      'tabDisabled',
      'panelActive',
      'panelInactive',
    ]) {
      expect(names.some((n) => n.includes(previouslyDropped))).toBe(true);
    }

    // Human-readable runtime evidence of the rendered table.
    const rows = parts!.map((p) => {
      const label =
        p.type?.kind === 'prop'
          ? p.type.propType
          : p.type?.kind === 'slot'
            ? p.type.required
              ? 'Slot (required)'
              : 'Slot'
            : p.type?.kind === 'root'
              ? 'Root'
              : 'Part';
      return `${p.name} → ${label}`;
    });
    console.log('[AnatomyTable/Tabs rendered rows]\n  ' + rows.join('\n  '));
  });

  it('Tabs: the base "tab" part renders in its own row with a Slot type label', () => {
    const parts = getAnatomyData(item('Tabs'))!;
    const { getByRole } = render(
      <AnatomyTable parts={parts} componentName="Tabs" />
    );
    const region = getByRole('region', { name: 'Tabs anatomy' });

    // Find the row whose rowheader is exactly 'tab' (stripping the decorative
    // glyph), then assert that same row's Type cell — not just that the table
    // contains "Slot" somewhere.
    const tabRow = within(region)
      .getAllByRole('row')
      .find((row) => {
        const header = within(row).queryAllByRole('rowheader')[0];
        return header?.textContent?.replace(/[^a-zA-Z]/g, '') === 'tab';
      });
    expect(tabRow).toBeDefined();
    const typeCell = within(tabRow!).getAllByRole('cell').at(-1);
    expect(typeCell?.textContent).toBe('Slot (required)');
  });

  it.each([
    ['Card', 'interactive'],
    ['Button', 'loadingText'],
    ['Popover', 'activeTrigger'],
  ])(
    '%s: renders the previously-dropped "%s" row',
    (component, previouslyDropped) => {
      const parts = getAnatomyData(item(component));
      expect(parts).not.toBeNull();
      const { getByRole } = render(
        <AnatomyTable parts={parts!} componentName={component} />
      );
      const region = getByRole('region', { name: `${component} anatomy` });
      const names = renderedPartNames(region);
      expect(names).toHaveLength(parts!.length);
      expect(names.some((n) => n.includes(previouslyDropped))).toBe(true);
    }
  );
});
