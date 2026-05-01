#!/usr/bin/env node
/**
 * Fix all known bad token path references in component *.tokens.json files.
 * Maps old/nonexistent paths to the correct paths that exist in designTokens.json.
 *
 * Usage:
 *   node scripts/fix-token-refs.mjs              # apply fixes
 *   node scripts/fix-token-refs.mjs --dry-run    # preview only
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'ui', 'components');
const DRY_RUN = process.argv.includes('--dry-run');

const RESET  = '\x1b[0m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BOLD   = '\x1b[1m';

// Map of { bad path ref } → { correct path ref }
// All values confirmed to generate existing CSS vars in designTokens.scss
const REPLACEMENTS = {
  // ── Size tokens (old numeric t-shirt scale) ──────────────────────────────
  '{size.3}':  '{core.spacing.size.05}',           // 12px
  '{size.4}':  '{core.spacing.size.06}',           // 16px
  '{size.5}':  '{core.spacing.size.07}',           // 24px (closest above 20px)
  '{size.6}':  '{core.spacing.size.07}',           // 24px
  '{size.12}': '{semantic.control.size.lg.height}', // 48px (input/control height)

  // ── Space scale ──────────────────────────────────────────────────────────
  '{space.200}': '{core.spacing.size.04}',          // 8px
  '{space.300}': '{core.spacing.size.05}',          // 12px

  // ── Border radius (old plain names) ──────────────────────────────────────
  '{radius.sm}': '{core.shape.radius.small}',       // 4px
  '{radius.md}': '{core.shape.radius.medium}',      // 8px

  // ── Shadow ───────────────────────────────────────────────────────────────
  '{shadow.md}': '{semantic.elevation.default}',

  // ── Color background (unprefixed, wrong namespace) ───────────────────────
  '{color.background.layer}':   '{semantic.color.background.primary}',
  '{color.background.muted}':   '{semantic.color.background.secondary}',
  '{color.background.subtle}':  '{semantic.color.background.secondary}',
  '{color.background.surface}': '{semantic.color.background.primary}',

  // ── Color foreground (unprefixed) ────────────────────────────────────────
  '{color.foreground.default}': '{semantic.color.foreground.primary}',
  '{color.foreground.muted}':   '{semantic.color.foreground.secondary}',

  // ── Color brand (unprefixed) ─────────────────────────────────────────────
  '{color.brand.500}': '{semantic.color.action.background.primary.default}',

  // ── Border width (unprefixed) ────────────────────────────────────────────
  '{border.width.1}': '{core.shape.border.width.hairline}',  // 1px

  // ── Focus ring (unprefixed) ──────────────────────────────────────────────
  '{focus.ring.width}':  '{interaction.focus.ringWidth}',
  '{focus.ring.color}':  '{semantic.color.border.focus}',
  '{focus.ring.offset}': '{interaction.focus.ringOffset}',

  // ── Core motion easing (wrong names) ─────────────────────────────────────
  '{core.motion.easing.in}':          '{core.motion.easing.emphasizedIn}',
  '{core.motion.easing.out}':         '{core.motion.easing.emphasizedOut}',
  '{core.motion.easing.accelerate}':  '{core.motion.easing.emphasizedIn}',
  '{core.motion.easing.decelerate}':  '{core.motion.easing.emphasizedOut}',

  // ── Core shape border width ───────────────────────────────────────────────
  '{core.shape.border.width.thin}': '{core.shape.border.width.hairline}',

  // ── Core spacing size (beyond scale max of 10) ───────────────────────────
  '{core.spacing.size.12}': '{core.spacing.size.09}',   // 48px
  '{core.spacing.size.14}': '{core.spacing.size.09}',   // 48px
  '{core.spacing.size.16}': '{core.spacing.size.10}',   // 64px

  // ── Core typography (wrong path structure) ────────────────────────────────
  '{core.typography.fontWeight.medium}':    '{core.typography.weight.medium}',
  '{core.typography.lineHeight.collapse}':  '{semantic.typography.lineHeight.collapse}',

  // ── Semantic color accent ─────────────────────────────────────────────────
  '{semantic.color.accent.brand}': '{semantic.color.background.accent}',

  // ── Semantic color background (wrong paths) ───────────────────────────────
  '{semantic.color.background.accentSubtle}': '{semantic.color.background.highlight}',
  '{semantic.color.background.danger}':       '{semantic.color.background.dangerStrong}',
  '{semantic.color.background.info}':         '{semantic.color.background.infoStrong}',
  '{semantic.color.background.overlay}':      '{semantic.color.background.imageOverlay}',
  '{semantic.color.background.success}':      '{semantic.color.background.successStrong}',
  '{semantic.color.background.surface}':      '{semantic.color.background.primary}',
  '{semantic.color.background.warning}':      '{semantic.color.background.warningStrong}',

  // ── Semantic color border ─────────────────────────────────────────────────
  '{semantic.color.border.focusRing}': '{semantic.color.border.focus}',
  '{semantic.color.border.secondary}': '{semantic.color.border.subtle}',

  // ── Semantic color feedback (wrong paths) ─────────────────────────────────
  '{semantic.color.feedback.danger}':                      '{semantic.color.feedback.border.danger}',
  '{semantic.color.feedback.danger.default}':              '{semantic.color.foreground.danger}',
  '{semantic.color.feedback.error.background}':            '{semantic.color.background.dangerSubtle}',
  '{semantic.color.feedback.error.background.active}':     '{semantic.color.background.active}',
  '{semantic.color.feedback.error.background.hover}':      '{semantic.color.background.hover}',
  '{semantic.color.feedback.success.border}':              '{semantic.color.feedback.border.success}',

  // ── Semantic color interactive ────────────────────────────────────────────
  '{semantic.color.interactive.primary}': '{semantic.color.border.accent}',

  // ── Semantic color mode ───────────────────────────────────────────────────
  '{semantic.color.mode.white}': '{core.color.mode.white}',

  // ── Semantic color status ─────────────────────────────────────────────────
  '{semantic.color.status.danger.fg}':  '{semantic.color.foreground.danger}',
  '{semantic.color.status.success.fg}': '{semantic.color.foreground.success}',
  '{semantic.color.status.warning.fg}': '{semantic.color.foreground.warning}',

  // ── Semantic duration / easing (wrong namespace) ──────────────────────────
  '{semantic.duration.fast}':     '{core.motion.duration.short}',
  '{semantic.easing.standard}':   '{core.motion.easing.standard}',

  // ── Semantic elevation (wrong or missing paths) ───────────────────────────
  '{semantic.elevation.02}':      '{semantic.elevation.surface.raised}',
  '{semantic.elevation.depth.2}': '{semantic.elevation.surface.floating}',
  '{semantic.elevation.hover}':   '{semantic.elevation.default}',

  // ── Semantic focus (composition type → concrete tokens) ───────────────────
  '{semantic.focus.ring}':        '{interaction.focus.ringWidth}',
  '{semantic.focus.ringOffset}':  '{interaction.focus.ringOffset}',

  // ── Semantic form density (token paths that don't exist) ──────────────────
  '{semantic.form.density.regular.gapY}':         '{semantic.spacing.density.compact.sm}',
  '{semantic.form.density.regular.labelFontSize}': '{semantic.typography.body.small.fontSize}',
  '{semantic.form.density.regular.padX}':          '{semantic.spacing.density.compact.md}',
  '{semantic.form.density.regular.padY}':          '{semantic.spacing.density.compact.sm}',

  // ── Semantic shape radius (wrong namespace — these are core tokens) ────────
  '{semantic.shape.radius.default}': '{core.shape.radius.default}',
  '{semantic.shape.radius.large}':   '{core.shape.radius.large}',
  '{semantic.shape.radius.medium}':  '{core.shape.radius.medium}',
  '{semantic.shape.radius.small}':   '{core.shape.radius.small}',

  // ── Semantic size border ──────────────────────────────────────────────────
  '{semantic.size.border.default}': '{core.shape.border.width.hairline}',
  '{semantic.size.border.offset}':  '{core.shape.border.width.thick}',

  // ── Semantic typography (wrong or old paths) ──────────────────────────────
  '{semantic.typography.body.05}':                '{semantic.typography.body.04}',
  '{semantic.typography.body.default}':           '{semantic.typography.body.default.fontSize}',
  '{semantic.typography.body.small}':             '{semantic.typography.body.small.fontSize}',
  '{semantic.typography.display.01}':             '{semantic.typography.oversize.01}',
  '{semantic.typography.display.02}':             '{semantic.typography.oversize.02}',
  '{semantic.typography.display.03}':             '{semantic.typography.oversize.03}',
  '{semantic.typography.display.04}':             '{semantic.typography.oversize.04}',
  '{semantic.typography.fontSize.body.default}':  '{semantic.typography.body.default.fontSize}',
  '{semantic.typography.fontSize.body.sm}':       '{semantic.typography.body.small.fontSize}',
  '{semantic.typography.fontSize.body.xs}':       '{semantic.typography.meta.caption.fontSize}',
  '{semantic.typography.fontWeight.body.default}':'{semantic.typography.fontWeight.regular}',
  '{semantic.typography.fontWeight.body.strong}': '{semantic.typography.fontWeight.bold}',
  '{semantic.typography.fontWeight.normal}':      '{semantic.typography.fontWeight.regular}',
  '{semantic.typography.fontWeight.semibold}':    '{semantic.typography.fontWeight.medium}',
  '{semantic.typography.lineHeight.body.default}':'{semantic.typography.body.default.lineHeight}',
  '{semantic.typography.lineHeight.default}':     '{semantic.typography.lineHeight.normal}',
  '{semantic.typography.lineHeight.relaxed}':     '{semantic.typography.lineHeight.loose}',
};

// Apply replacements recursively to any string in a JSON structure
function applyReplacements(val) {
  if (typeof val === 'string') {
    return REPLACEMENTS[val] ?? val;
  }
  if (Array.isArray(val)) {
    return val.map(applyReplacements);
  }
  if (val && typeof val === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      out[k] = applyReplacements(v);
    }
    return out;
  }
  return val;
}

const componentDirs = readdirSync(COMPONENTS_DIR, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name)
  .sort();

let totalFixed = 0;
let totalFiles = 0;

for (const name of componentDirs) {
  const jsonPath = path.join(COMPONENTS_DIR, name, `${name}.tokens.json`);
  if (!existsSync(jsonPath)) continue;

  let original;
  let data;
  try {
    original = readFileSync(jsonPath, 'utf8');
    data = JSON.parse(original);
  } catch {
    continue;
  }

  const updated = applyReplacements(data);
  const updatedStr = JSON.stringify(updated, null, 2) + '\n';

  if (updatedStr === original) continue;

  // Count replacements made
  let count = 0;
  for (const [from, to] of Object.entries(REPLACEMENTS)) {
    const pattern = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matches = original.match(new RegExp(pattern, 'g'));
    if (matches) count += matches.length;
  }

  totalFixed += count;
  totalFiles++;

  if (DRY_RUN) {
    console.log(`${YELLOW}Would fix: ${name} (${count} replacement(s))${RESET}`);
  } else {
    writeFileSync(jsonPath, updatedStr);
    console.log(`${GREEN}Fixed: ${name} (${count} replacement(s))${RESET}`);
  }
}

const verb = DRY_RUN ? 'Would fix' : 'Fixed';
console.log(`\n${BOLD}${verb} ${totalFixed} references across ${totalFiles} component token files${RESET}`);
