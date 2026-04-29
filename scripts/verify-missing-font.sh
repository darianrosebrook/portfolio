#!/bin/bash
# Missing-font probe for VERIFICATION-001 (A5).
#
# Renames public/fonts/Nohemi-VF.ttf to a temporary path, runs the real-font
# accuracy suite, and asserts the suite hard-fails with a readable
# missing-font error in beforeAll. The font is always restored, even if
# vitest crashes — a trap on EXIT does the cleanup.
#
# Exits 0 only when:
#   1. The font was successfully hidden.
#   2. vitest exited non-zero.
#   3. The error output references the font filename (proving the failure
#      was missing-font, not some unrelated regression).
#   4. The font was successfully restored to its original path.
#   5. A re-run of the full suite passes (proving the probe left no residue).
#
# @author @darianrosebrook

set -euo pipefail

FONT_REL="public/fonts/Nohemi-VF.ttf"
FONT_ABS="$(cd "$(dirname "$0")/.." && pwd)/$FONT_REL"
TMP_FONT="${FONT_ABS}.missing-font-probe"

if [[ ! -f "$FONT_ABS" ]]; then
  echo "verify-missing-font: $FONT_REL not found at $FONT_ABS — cannot run probe." >&2
  exit 2
fi

restore_font() {
  if [[ -f "$TMP_FONT" ]] && [[ ! -f "$FONT_ABS" ]]; then
    mv "$TMP_FONT" "$FONT_ABS"
  fi
}
trap restore_font EXIT INT TERM

# Phase 1: hide the font.
mv "$FONT_ABS" "$TMP_FONT"
if [[ -f "$FONT_ABS" ]]; then
  echo "verify-missing-font: failed to hide $FONT_REL" >&2
  exit 1
fi

# Phase 2: run the real-font accuracy suite. Capture output. Expect non-zero
# exit and an error message that references the font path.
TEST_LOG=$(mktemp)
set +e
pnpm vitest run test/typeAnatomy/feature-accuracy.test.ts > "$TEST_LOG" 2>&1
EXIT_CODE=$?
set -e

# Phase 3: restore so that the rest of the test runs against a real font again.
restore_font
trap - EXIT INT TERM

if [[ $EXIT_CODE -eq 0 ]]; then
  echo "verify-missing-font: FAIL — vitest exited 0 with the font hidden. The accuracy suite is silently passing on missing fonts." >&2
  cat "$TEST_LOG" >&2
  rm -f "$TEST_LOG"
  exit 1
fi

# Phase 4: prove the failure is the missing-font, not a generic crash. The
# loadFont helper in test/utils/fixtures/fontFixtures.ts throws an error
# that includes the missing path; grep for the basename.
if ! grep -q "Nohemi-VF.ttf" "$TEST_LOG"; then
  echo "verify-missing-font: FAIL — vitest failed but error did not reference Nohemi-VF.ttf. The failure may be a generic crash, not a readable missing-font error." >&2
  cat "$TEST_LOG" >&2
  rm -f "$TEST_LOG"
  exit 1
fi

# Phase 5: re-run the suite to confirm restoration left no residue.
pnpm vitest run test/typeAnatomy/feature-accuracy.test.ts > /dev/null

echo "verify-missing-font: PASS — accuracy suite hard-failed with readable missing-font error; font restored; re-run clean."
rm -f "$TEST_LOG"
exit 0
