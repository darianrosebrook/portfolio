/**
 * Build the inspector's anatomy toggle list from the canonical
 * `fontfeatures/anatomy.json` glossary, filtered to FeatureIDs that have
 * a registered detector. Replaces the previous hardcoded ~140-line array
 * so the CSV/JSON taxonomy is the single source of truth: adding a new
 * toggle requires only (a) a row in the CSV, (b) a `term -> FeatureID`
 * mapping in `FEATURE_DISPLAY_NAMES`, and (c) a registered detector.
 *
 * Metric guides (Baseline, Cap height, etc.) live under a separate
 * `spacing-and-metrics` category in the JSON; we keep them as a small
 * static array so the order and `selected: true` defaults stay stable.
 */

import { getRegisteredFeatures } from '@/utils/typeAnatomy/detectorRegistry';
import { toFeatureID, type FeatureID } from '@/utils/typeAnatomy/types';
import anatomyData from '@/app/blueprints/foundations/typography/fontfeatures/anatomy.json';
import type { AnatomyFeature } from './types';

interface AnatomyTerm {
  id: string;
  term: string;
  aliases?: string[];
  letterforms?: string[];
}

interface AnatomyJSON {
  terms: AnatomyTerm[];
}

const METRIC_FEATURES: AnatomyFeature[] = [
  {
    feature: 'Baseline',
    label: 'Baseline',
    labelPosition: 'bottom',
    disabled: false,
    selected: true,
    readonly: false,
  },
  {
    feature: 'Cap height',
    label: 'Cap height',
    labelPosition: 'top',
    disabled: false,
    selected: true,
    readonly: false,
  },
  {
    feature: 'X-height',
    label: 'X-height',
    labelPosition: 'top',
    disabled: false,
    selected: true,
    readonly: false,
  },
  {
    feature: 'Ascender',
    label: 'Ascender',
    labelPosition: 'top',
    disabled: false,
    selected: true,
    readonly: false,
  },
  {
    feature: 'Descender',
    label: 'Descender',
    labelPosition: 'bottom',
    disabled: false,
    selected: true,
    readonly: false,
  },
];

// FeatureIDs whose label sits above the glyph rather than below. Drawn
// from the prior hardcoded list so the UI ordering of dot-on-top vs
// dot-on-bottom labels stays consistent with what users have today.
const TOP_LABEL_IDS: ReadonlySet<FeatureID> = new Set<FeatureID>([
  'apex',
  'tittle',
  'arm',
  'ear',
]);

function labelPositionFor(id: FeatureID): 'top' | 'bottom' {
  return TOP_LABEL_IDS.has(id) ? 'top' : 'bottom';
}

/**
 * Build the full anatomy + metrics toggle list, deduped by FeatureID.
 * The order is: metric guides first (stable), then anatomy entries in
 * the order they appear in `anatomy.json`.
 *
 * Exported as a constant rather than a function because the JSON import
 * is static; recomputing per render would be wasteful and reference-
 * unstable for React memoisation downstream.
 */
function build(): AnatomyFeature[] {
  const registered = new Set<FeatureID>(getRegisteredFeatures());
  const seen = new Set<FeatureID>();
  const anatomyEntries: AnatomyFeature[] = [];

  const terms = (anatomyData as AnatomyJSON).terms;
  for (const t of terms) {
    const id = toFeatureID(t.term);
    if (!id) continue;
    if (!registered.has(id)) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    anatomyEntries.push({
      feature: t.term,
      label: t.term,
      labelPosition: labelPositionFor(id),
      disabled: false,
      selected: false,
      readonly: false,
    });
  }

  return [...METRIC_FEATURES, ...anatomyEntries];
}

export const ANATOMY_FEATURES: AnatomyFeature[] = build();
