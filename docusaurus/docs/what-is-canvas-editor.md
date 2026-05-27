---
sidebar_position: 1
---

# What is Canvas Editor?

**Canvas Editor** is a rich text editor that renders documents on `<canvas>` / SVG instead of `contenteditable`. It extends [canvas-editor-plugin](https://github.com/Hufe921/canvas-editor-plugin) with table support, improved font sizing, and exported DOM handlers so any UI framework can drive the toolbar.

:::tip Upstream Reference
Engine internals are documented at [hufe.club/canvas-editor-docs](https://hufe.club/canvas-editor-docs/). This site covers the `@mindfiredigital/canvas-editor` distribution and its public API.
:::

## Why canvas?

Canvas-based rendering gives pixel-accurate, paginated, print-ready layout that browser-native editing cannot match — useful for EMR forms, contracts, reports, and any document where the on-screen view must equal the print view.

## Key Features

- **Pagination** — page-aware editing with headers, footers, and page numbers.
- **Tables** — insert, navigate, and edit tables inline.
- **Exported DOM handlers** — bind bold / italic / list / image / table actions to any toolbar UI (React, Vue, plain JS).
- **Improved font sizing** — more predictable size handling than upstream defaults.
- **TypeScript** — full type definitions shipped in the package.
- **Framework-agnostic** — no React/Vue runtime dependency in the bundle.

## When to Use

- Building EMR / clinical document editors
- Contract or legal document authoring with strict pagination
- Report generators where print fidelity matters
- Any product needing a print-equals-screen WYSIWYG experience

## Quick Install

```bash
npm install @mindfiredigital/canvas-editor
```

## Next Steps

- [Installation](./Get-started/Installation) — requirements and supported bundlers
- [Quick Start](./Get-started/quickstart) — mount the editor in under 5 minutes
- [DOM Events](./references/dom-event) — toolbar handler reference
- [How to Contribute](./contributors/how-to-contribute) — set up the repo and ship a PR
