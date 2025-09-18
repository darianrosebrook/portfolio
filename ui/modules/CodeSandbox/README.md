# Docs module architecture

This folder contains the next-gen docs playground system composed from small primitives. Start here when adding examples to the design system site.

## Primitives

- CodeWorkbench — orchestrates virtual file system and editor engine
- CodeEditor — the concrete editor view (initially Sandpack CodeMirror)
- CodePreview — iframe or in-page preview, device presets, reduced-motion
- PropControls — knobs panel for interactive props
- VariantMatrix — grid renderer for variant axes
- FileTabs — simple tabbed file navigation
- ConsolePanel — runtime log viewer
- SectionSync — connects doc sections to editor decorations

## Variants (presets)

- DocInteractive — content + code + preview with section sync
- DocSandbox — multi-file sandbox with tabs/tree, console
- DocVariants — matrix + controls; optional code for selection
- DocDiff — unified/split diff with optional dual preview

## Types

Edit `types.ts` for core contracts: `VirtualProject`, `SectionSpec`, `Decoration`, `VariantAxis`, `ControlDef`, `VariantGrid`.

## How to use

- Import from `@/ui/modules/docs`
- Author per-page configs in `docs/*.playground.ts` and pass to a variant component.

## Roadmap

- Switchable editor engines (codemirror/monaco)
- A11y & Perf panels
- Token/Theme explorer
