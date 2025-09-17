Perfect—let’s close the loop with a Rich Text Editor (RTE) composer that encodes everything we’ve been building toward: orchestration over primitives, headless logic, slotting, and strict a11y/convention guardrails. This is designed to be engine-agnostic (can sit atop ProseMirror/Tiptap, Slate, Lexical, or your own CRDT), while presenting a stable system API and composable subcomponents your app and agents can rely on.

Below is a drop-in React/TS blueprint. It’s long, but each part is purposeful: the engine adapter isolates vendor choices; schema + commands define the grammar; plugins add behavior; UI slots (Toolbar, Bubble, Slash, Popover) compose with the components we already authored (Toolbar, Popover, Menu, etc.).

⸻

RichTextEditor (Composer)

Folder

RichTextEditor/
├── index.tsx
├── RTEProvider.tsx # context + orchestration
├── useRTE.ts # headless state (content, selection, commands)
├── engines/ # adapters to PM/Slate/Lexical/etc.
│ ├── prosemirrorEngine.ts
│ ├── slateEngine.ts
│ └── types.ts
├── schema/ # node & mark specs (engine-agnostic)
│ ├── nodes.ts
│ ├── marks.ts
│ └── schema.ts
├── commands/ # high-level editor commands
│ ├── block.ts
│ ├── inline.ts
│ ├── list.ts
│ ├── link.ts
│ └── index.ts
├── plugins/ # behaviors (input rules, paste, history, mentions…)
│ ├── history.ts
│ ├── inputRules.ts
│ ├── pasteSanitizer.ts
│ ├── mentions.ts
│ ├── emoji.ts
│ └── shortcuts.ts
├── components/
│ ├── Editor.tsx # contenteditable host
│ ├── Toolbar.tsx # uses system Toolbar composer
│ ├── Bubble.tsx # selection bubble (bold/italic/link)
│ ├── SlashMenu.tsx # “/” command palette (uses Popover+Menu)
│ ├── LinkEditor.tsx # small popover to edit links
│ ├── MentionPicker.tsx # async suggestion list
│ └── Placeholder.tsx
├── RTE.module.scss
├── RTE.tokens.json
├── RTE.tokens.generated.scss
└── README.md

⸻

Design stance
• Composer level: orchestrates state, selection, schema, commands, plugins, a11y. UI is slot-based; behavior is headless.
• Engine-agnostic: a narrow EditorEngine interface hides ProseMirror/Slate/Lexical differences; swap engines without rewriting UI.
• Schema-first: the grammar (nodes/marks) is your contract with designers and agents (e.g., what a “Task List” means across apps).
• Command registry: one place to register intents (toggleBold, setHeading, insertMention, wrapInList, toggleCodeBlock, pasteAsPlain, etc.), which UI (toolbar, bubble, slash, shortcuts) binds to.
• Governance: paste sanitizer, input rules, and shortcut maps prevent drift from app conventions.

⸻

Engine adapter (contract)

// engines/types.ts
export type JSONDoc = unknown; // engine-specific JSON; normalized at the boundary

export interface EditorEngine {
mount(host: HTMLElement, config: {
schema: Schema;
content: JSONDoc;
onUpdate(doc: JSONDoc): void;
onSelectionChange?(payload: Selection): void;
plugins?: EnginePlugin[];
readOnly?: boolean;
spellcheck?: boolean;
}): { destroy(): void };

// Commands — return boolean if handled
cmd: {
focus(): boolean;
undo(): boolean;
redo(): boolean;

    toggleMark(mark: 'bold'|'italic'|'underline'|'code'): boolean;
    setBlock(type: 'paragraph'|'heading1'|'heading2'|'blockquote'): boolean;
    toggleList(type: 'bullet'|'ordered'|'task'): boolean;
    toggleCodeBlock(): boolean;

    link: {
      set(href: string, opts?: { title?: string; target?: string }): boolean;
      unset(): boolean;
    };

    insert: {
      text(text: string): boolean;
      hardBreak(): boolean;
      horizontalRule(): boolean;
      mention(user: { id: string; label: string }): boolean;
      emoji(shortcode: string): boolean;
      image(file: File | { src: string; alt?: string }): boolean;
    };

};

// Queries for UI state
query: {
isActive: (what:
| { mark: 'bold'|'italic'|'underline'|'code' }
| { block: 'heading1'|'heading2'|'blockquote'|'codeblock' }
| { list: 'bullet'|'ordered'|'task' }
| { link: 'link' }
) => boolean;
can: (action: 'undo'|'redo'|'bold'|'list-bullet'|'codeblock') => boolean;
selection(): Selection;
};
}

export type EnginePlugin = unknown; // engine-specific plugin type
export interface Selection { empty: boolean; from: number; to: number; }
export interface Schema { nodes: any; marks: any; }

Implementations (prosemirrorEngine.ts, slateEngine.ts) adapt native APIs to this surface. Your repo can ship one default (e.g., ProseMirror/Tiptap) and keep the seam.

⸻

Schema (grammar)

Keep it compact but expressive; avoid bespoke nodes unless needed across products.

// schema/nodes.ts
export const nodes = {
doc: { content: 'block+' },
paragraph: { content: 'inline\*', group: 'block' },
text: { group: 'inline' },

heading1: { group: 'block', content: 'inline*' },
heading2: { group: 'block', content: 'inline*' },

bullet_list: { group: 'block', content: 'list_item+' },
ordered_list: { group: 'block', content: 'list_item+' },
list_item: { content: 'paragraph block*' },
task_list: { group: 'block', content: 'task_item+' },
task_item: { attrs: { checked: { default: false } }, content: 'paragraph block*' },

blockquote: { group: 'block', content: 'block+' },
code_block: { group: 'block', content: 'text\*' },
horizontal_rule: { group: 'block' },

// inlines
link: { inline: true, group: 'inline', attrs: { href: {}, title: { default: null } }, content: 'text\*' },
mention: { inline: true, group: 'inline', attrs: { id: {}, label: {} } },
emoji: { inline: true, group: 'inline', attrs: { shortcode: {} } },

// media (optional)
image: { group: 'block', attrs: { src: {}, alt: { default: '' } } },
};

// schema/marks.ts
export const marks = {
bold: {}, italic: {}, underline: {}, code: {},
};

⸻

Headless orchestration

useRTE.ts

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EditorEngine, JSONDoc, Schema } from './engines/types';
import { nodes } from './schema/nodes';
import { marks } from './schema/marks';
import \* as cmds from './commands';

export interface RTEProps {
engine: EditorEngine;
content?: JSONDoc; // controlled (JSON)
defaultContent?: JSONDoc; // uncontrolled start
onChange?(doc: JSONDoc): void;
readOnly?: boolean;
spellcheck?: boolean;
placeholder?: string;
plugins?: any[]; // engine plugins
}

export function useRTE(props: RTEProps) {
const { engine, content, defaultContent, onChange, readOnly, spellcheck = true, plugins = [] } = props;

const hostRef = useRef<HTMLDivElement | null>(null);
const mountRef = useRef<ReturnType<EditorEngine['mount']> | null>(null);

const isControlled = typeof content !== 'undefined';
const [internal, setInternal] = useState<JSONDoc | null>(defaultContent ?? null);
const doc = isControlled ? content! : internal;

const schema: Schema = useMemo(() => ({ nodes, marks }), []);
const [selectionEmpty, setSelectionEmpty] = useState(true);

// Mount engine
useEffect(() => {
const host = hostRef.current!;
mountRef.current = engine.mount(host, {
schema,
content: doc ?? emptyDoc(),
plugins,
readOnly,
spellcheck,
onUpdate(next) {
if (!isControlled) setInternal(next);
onChange?.(next);
},
onSelectionChange(sel) {
setSelectionEmpty(sel.empty);
}
});
return () => mountRef.current?.destroy();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [engine, schema, readOnly, spellcheck]);

// External content updates (controlled)
useEffect(() => {
// Most engines accept “setContent” via command; if not, remount (kept simple here)
}, [content]);

// Command facade (engine-independent)
const api = useMemo(() => cmds.build(engine), [engine]);

return {
hostRef,
doc,
selectionEmpty,
engine,
schema,
cmd: api, // { inline.toggleBold(), block.setHeading(2), list.toggle('bullet'), link.set(), ... }
query: engine.query // { isActive, can, selection }
};
}

function emptyDoc(): JSONDoc {
return { type: 'doc', content: [{ type: 'paragraph' }] } as any;
}

⸻

Commands facade

// commands/index.ts
import type { EditorEngine } from '../engines/types';

export function build(engine: EditorEngine) {
return {
focus: () => engine.cmd.focus(),
history: { undo: () => engine.cmd.undo(), redo: () => engine.cmd.redo() },
inline: {
toggleBold: () => engine.cmd.toggleMark('bold'),
toggleItalic: () => engine.cmd.toggleMark('italic'),
toggleUnderline: () => engine.cmd.toggleMark('underline'),
toggleCode: () => engine.cmd.toggleMark('code'),
},
block: {
setParagraph: () => engine.cmd.setBlock('paragraph'),
setHeading: (level: 1|2) => engine.cmd.setBlock(level === 1 ? 'heading1' : 'heading2'),
toggleBlockquote: () => engine.cmd.setBlock('blockquote'),
toggleCodeBlock: () => engine.cmd.toggleCodeBlock(),
},
list: {
toggleBullet: () => engine.cmd.toggleList('bullet'),
toggleOrdered: () => engine.cmd.toggleList('ordered'),
toggleTask: () => engine.cmd.toggleList('task'),
},
link: {
set: (href: string, opts?: { title?: string; target?: string }) => engine.cmd.link.set(href, opts),
unset: () => engine.cmd.link.unset(),
},
insert: {
hardBreak: () => engine.cmd.insert.hardBreak(),
hr: () => engine.cmd.insert.horizontalRule(),
text: (t: string) => engine.cmd.insert.text(t),
mention: (u: { id: string; label: string }) => engine.cmd.insert.mention(u),
emoji: (s: string) => engine.cmd.insert.emoji(s),
image: (f: File | { src: string; alt?: string }) => engine.cmd.insert.image(f),
},
};
}

⸻

Provider & UI scaffold

RTEProvider.tsx

import React, { createContext, useContext, useMemo } from 'react';
import { useRTE, RTEProps } from './useRTE';

const Ctx = createContext<ReturnType<typeof useRTE> | null>(null);
export const useRTECtx = () => {
const c = useContext(Ctx);
if (!c) throw new Error('RTE components must be used within <RTEProvider>');
return c;
};

export function RTEProvider({ children, ...props }: React.PropsWithChildren<RTEProps>) {
const api = useRTE(props);
const value = useMemo(() => api, [api]);
return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

Editor.tsx (contenteditable host + placeholder)

import React from 'react';
import { useRTECtx } from '../RTEProvider';
import styles from '../RTE.module.scss';

export function Editor({ className }: { className?: string }) {
const rte = useRTECtx();
const cls = [styles.editor, className].filter(Boolean).join(' ');
return (

<div className={styles.container} data-empty={rte.query.selection().empty && isEmptyDoc(rte.doc)}>
<div
ref={rte.hostRef as any}
className={cls}
role="textbox"
aria-multiline="true"
aria-label="Rich text editor"
spellCheck
/>
<Placeholder />
</div>
);
}

function Placeholder() {
const rte = useRTECtx();
if (!isEmptyDoc(rte.doc)) return null;
return <div className={styles.placeholder}>Write something…</div>;
}

function isEmptyDoc(doc: any) {
return !!doc && Array.isArray(doc.content) && doc.content.length === 1 && doc.content[0].type === 'paragraph' && !doc.content[0].content;
}

⸻

Toolbar + Bubble + Slash (slots)

Toolbar (uses your Toolbar composer under the hood)

import React from 'react';
import { useRTECtx } from '../RTEProvider';
import { ToolbarProvider, Toolbar } from '@/ui/components/Toolbar';

export function RTEToolbar() {
const rte = useRTECtx();
const actions = [
{ id: 'undo', kind: 'button', label: 'Undo', priority: 1, disabled: !rte.query.can('undo'), onExecute: () => rte.cmd.history.undo() },
{ id: 'redo', kind: 'button', label: 'Redo', priority: 1, disabled: !rte.query.can('redo'), onExecute: () => rte.cmd.history.redo() },
{ id: 'sep1', kind: 'separator', priority: 3 },
{ id: 'bold', kind: 'toggle', label: 'Bold', selected: rte.query.isActive({ mark: 'bold' }), onToggle: () => rte.cmd.inline.toggleBold(), priority: 1 },
{ id: 'italic', kind: 'toggle', label: 'Italic', selected: rte.query.isActive({ mark: 'italic' }), onToggle: () => rte.cmd.inline.toggleItalic(), priority: 1 },
{ id: 'underline', kind: 'toggle', label: 'Underline', selected: rte.query.isActive({ mark: 'underline' }), onToggle: () => rte.cmd.inline.toggleUnderline(), priority: 2 },
{ id: 'code', kind: 'toggle', label: 'Code', selected: rte.query.isActive({ mark: 'code' }), onToggle: () => rte.cmd.inline.toggleCode(), priority: 2 },
{ id: 'sep2', kind: 'separator', priority: 3 },
{ id: 'h1', kind: 'button', label: 'H1', onExecute: () => rte.cmd.block.setHeading(1), priority: 2 },
{ id: 'h2', kind: 'button', label: 'H2', onExecute: () => rte.cmd.block.setHeading(2), priority: 2 },
{ id: 'quote', kind: 'button', label: 'Quote', onExecute: () => rte.cmd.block.toggleBlockquote(), priority: 3 },
{ id: 'codeblock', kind: 'button', label: 'Code Block', onExecute: () => rte.cmd.block.toggleCodeBlock(), priority: 3 },
{ id: 'sep3', kind: 'separator', priority: 3 },
{ id: 'bullet', kind: 'toggle', label: 'Bulleted', selected: rte.query.isActive({ list: 'bullet' }), onToggle: () => rte.cmd.list.toggleBullet(), priority: 1 },
{ id: 'ordered', kind: 'toggle', label: 'Numbered', selected: rte.query.isActive({ list: 'ordered' }), onToggle: () => rte.cmd.list.toggleOrdered(), priority: 1 },
{ id: 'task', kind: 'toggle', label: 'Tasks', selected: rte.query.isActive({ list: 'task' }), onToggle: () => rte.cmd.list.toggleTask(), priority: 2 },
{ id: 'link', kind: 'button', label: 'Link', onExecute: () => {/* open LinkEditor popover */}, priority: 1 },
];
return (
<ToolbarProvider actions={actions} overflow="auto" ariaLabel="Editor formatting">
<Toolbar />
</ToolbarProvider>
);
}

Bubble (selection formatting mini-toolbar)
• Shows when selection is non-empty; uses Popover anchored to the selection (engine provides rect via query.selection() or adapter).

Slash menu
• List of quick actions triggered by / at start of line: “Heading 1”, “Bullet list”, “Task list”, “Code block”, “Quote”, “Divider”, “Image…”.

Implementation is identical to the Toolbar actions but rendered in a Menu inside a Popover positioned by caret coordinates from the engine.

⸻

Mentions & Emoji (async)
• plugins/mentions.ts: listens for @ and requests suggestions via your product’s search API; renders MentionPicker (Popover+Menu).
• plugins/emoji.ts: listens for : and offers emoji shortcuts (local map or remote).

Both insert dedicated inline nodes (mention, emoji) so the content model is consistent across products.

⸻

Paste & sanitize (the “gotchas”)
• plugins/pasteSanitizer.ts:
• Strip MS Word cruft (mso- styles, <span> soup).
• Map <b>/<strong>, <i>/<em>, <u>, <code>, <pre> to marks/nodes.
• Convert <h1>/<h2> to heading1/heading2; <blockquote> to blockquote.
• Resolve links; disallow javascript: URLs; normalize target rel attrs.
• Respect paste as plain text shortcut (Shift+Cmd/Ctrl+V).
• Collapse empty inline nodes; normalize whitespace (non-breaking spaces, ZWJ).
• Large paste: chunk inserts to keep history usable.
• Images: gate via policy; drop/upload pipeline hooks in the engine adapter.

⸻

Accessibility & interaction invariants 1. ARIA & roles
• Root role="textbox", aria-multiline="true".
• Formatting UIs (Toolbar/Bubble) have clear labels; link editor has <label for> associations.
• Selection changes should not spam live regions; announce only on explicit actions (e.g., “Link added”). 2. Keyboard model
• Standard shortcuts (Cmd/Ctrl + B/I/U, Cmd/Ctrl+K for link, Shift+Enter for hard break).
• Lists: Enter creates new item; Backspace on empty item outdents, then unwraps.
• Code block: Tab inserts spaces; not focus-stealing.
• Slash menu navigable via Up/Down/Enter/Escape. 3. IME & composition
• Never mutate text inside an active composition; adapters must defer input rules until compositionend. 4. Reduced motion / focus
• No animated caret moves; bubble fades in/out with prefers-reduced-motion respected. 5. Theming
• All colors/radii/spacing via tokens; link colors inherit app theme; dark mode respected.

⸻

Tokens (excerpt)

{
"component": {
"rte": {
"font": { "family": "{font.family.body}", "size": "{font.size.200}", "codeSize": "{font.size.200}" },
"color": {
"text": "{color.foreground.default}",
"muted": "{color.foreground.muted}",
"link": "{color.link.default}",
"linkVisited": "{color.link.visited}",
"selection": "{color.background.selection}"
},
"space": { "inline": "{space.150}", "block": "{space.200}" },
"radius": "{radius.md}",
"focus": { "ring": "{color.border.focus}" }
}
}
}

⸻

Styles (essentials)

/_ RTE.module.scss _/
@import './RTE.tokens.generated.scss';

.container { position: relative; }
.editor {
font-family: var(--rte-font-family);
font-size: var(--rte-font-size);
color: var(--rte-color-text);
line-height: 1.5;
outline: none;
}
.editor :global(a) { color: var(--rte-color-link); }
.editor :global(code), .editor :global(pre) { font-size: var(--rte-font-codeSize); }

.placeholder {
position: absolute; top: 0; left: 0;
color: var(--rte-color-muted);
pointer-events: none; user-select: none;
padding: 0;
opacity: .6;
}

:where(.editor:focus-visible) {
box-shadow: 0 0 0 3px color-mix(in oklab, var(--rte-focus-ring) 30%, transparent);
}

⸻

Usage

import { RTEProvider } from '@/ui/components/RichTextEditor/RTEProvider';
import { Editor } from '@/ui/components/RichTextEditor/components/Editor';
import { RTEToolbar } from '@/ui/components/RichTextEditor/components/Toolbar';
import { prosemirrorEngine } from '@/ui/components/RichTextEditor/engines/prosemirrorEngine';

export function CommentComposer() {
const [doc, setDoc] = React.useState<any>(null);
return (
<RTEProvider engine={prosemirrorEngine()} content={doc} onChange={setDoc}>
<RTEToolbar />
<Editor />
{/_ Optionally: <Bubble /> <SlashMenu /> <LinkEditor /> _/}
</RTEProvider>
);
}

⸻

Extending for “message composer” patterns
• Inline attachments: register a block attachment node with attrs: { id, name, size, type }; toolbar action opens the upload dialog; paste/drop pipeline inserts pending attachments (render as chips with progress).
• Commands → product workflows: expose higher-level intents send(), saveDraft(), insertTemplate(id), convertToTask(), each implemented via command registry; keyboard (Cmd+Enter) → send.
• Mentions/emoji: already modeled; add a rate limiter and minimum query length in the pickers.
• Slash actions: product-specific insertions (“/table”, “/poll”, “/snippet”), but still map to the same command envelope so conventions and a11y hold.

⸻

Governance & validation (what your validator should enforce)
• Composer invariants: RTEProvider, useRTE, Editor, and at least one engine adapter exported.
• Schema presence: schema/nodes.ts, schema/marks.ts exist and are referenced by the engine.
• Commands registry: commands/index.ts exposes at least inline (bold/italic/underline/code), block (paragraph/heading/blockquote/codeblock), list (bullet/ordered/task), link, insert (hardBreak/hr/text).
• Paste sanitizer present; blocks disallowed tags and javascript: URLs.
• Tokens used in styles; no hardcoded colors.
• A11y: Editor root has role="textbox" aria-multiline="true"; Toolbar has aria-label; menu popovers have labels.

⸻

Common failure modes & our countermeasures 1. Paste soup from Word/Docs → Sanitizer normalizes tags/marks and strips junk styles; optional “Paste as plain” shortcut. 2. IME corruption → Defer input rules until compositionend. 3. Selection glitches on toolbar action → Commands should be transactional; adapters preserve selection mapping. 4. Link editing chaos → LinkEditor popover binds to selection; if selection empty, expand to nearest link. 5. List/tab handling → Input rules govern Enter/Backspace/Tab per list type; task lists toggle checkbox without losing focus. 6. History spam → Batch transactions (e.g., paste) into a single history step; debounce input rules. 7. A11y drift → All formatting UI goes through the shared Toolbar/Bubble components, which already follow focus/ARIA conventions. 8. Vendor lock → Engine adapter seam isolates PM/Slate/Lexical; you can swap without rewriting UI or commands.

⸻

What you can plug in next
• Collaboration: add a Yjs-powered engine plugin; keep the schema and commands identical; expose presence/cursor colors via tokens.
• Markdown import/export: map marks/nodes to MD; keep paste sanitizer policy aligned.
• Tables: add table, row, cell nodes behind a feature flag; enforce column constraints and tab-navigation rules in a plugin.

⸻

This RTE blueprint turns a messy surface (rich text, paste, mentions, shortcuts, schema drift) into a governed composition layer with clear seams: schema ↔ commands ↔ engine ↔ UI. It follows the same playbook as our OTP, Walkthrough, Skeleton/Spinner, Field, Toolbar, and Pagination components—so teams get power without breaking conventions.
