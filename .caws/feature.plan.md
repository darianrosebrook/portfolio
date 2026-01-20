# Feature Plan: Article Publishing Pipeline Audit & Fix

## Design Sketch
The publishing pipeline follows a Draft -> Published lifecycle using "working columns" to prevent autosave from overwriting public content.

### Flow:
1.  **Creation (POST):** Create article with initial content in both main and working columns. Status: `draft`.
2.  **Autosave (PATCH):** Updates *only* `working*` columns. Sets `is_dirty = true`.
3.  **Publish (PUT):** Copies `working*` -> main columns. Sets `status = 'published'`, `is_dirty = false`, `published_at = now`.
4.  **Unpublish (PUT):** Sets `status = 'draft'`. Main columns remain (or could be cleared/archived, but usually they stay).

## Test Matrix
| Case | Method | Input | Expected Output |
| :--- | :--- | :--- | :--- |
| Autosave | PATCH | `{ workingHeadline: 'New' }` | `workingheadline` updated, `headline` unchanged |
| Publish | PUT | `{ status: 'published' }` | `headline` = `workingheadline`, `status` = 'published' |
| Create | POST | `{ headline: 'Initial' }` | Both `headline` and `workingheadline` set |
| Unauthorized | PATCH | (different user) | 401/403 Unauthorized |

## Data Plan
Synthetic article data with Tiptap JSON content.
Fixtures for:
- New Draft Article
- Published Article with Dirty Draft

## Observability Plan
- Log every publish event with `slug` and `authorId`.
- Trace database update duration for `PATCH` vs `PUT`.
