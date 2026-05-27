<h1 align="center">Canvas Editor</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@mindfiredigital/canvas-editor"><img src="https://img.shields.io/npm/v/@mindfiredigital/canvas-editor.svg?sanitize=true" alt="Version"></a>
  <a href="https://www.npmjs.com/package/@mindfiredigital/canvas-editor"><img src="https://img.shields.io/npm/dm/@mindfiredigital/canvas-editor.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/@mindfiredigital/canvas-editor"><img src="https://img.shields.io/npm/l/@mindfiredigital/canvas-editor.svg?sanitize=true" alt="License"></a>
  <a href="https://github.com/mindfiredigital/canvas-editor/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome"></a>
</p>

<p align="center">A rich text editor rendered with canvas/SVG.</p>

**Canvas Editor** extends [canvas-editor-plugin](https://github.com/Hufe921/canvas-editor-plugin) with table support, font size improvements, and exported DOM handlers so you can build your own toolbar UI on top of it. Thanks to the upstream authors for their work.

---

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API](#api)
  - [Exports](#exports)
  - [DOM Handlers](#dom-handlers)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Features
- **Canvas / SVG rendering** — pixel-accurate layout, page-aware editing.
- **Tables** — insert and edit tables inside the document.
- **Exported DOM handlers** — drive the editor from any toolbar component (React, Vue, plain JS).
- **Improved font sizing** — better readability over upstream defaults.
- **TypeScript types** — full `.d.ts` shipped in the package.

## Installation

```bash
npm install @mindfiredigital/canvas-editor
# or
yarn add @mindfiredigital/canvas-editor
# or
pnpm add @mindfiredigital/canvas-editor
```

Requires Node.js `>= 12` for build tooling.

## Quick Start

```js
import Editor, { EditorMode, PageMode } from '@mindfiredigital/canvas-editor'

const container = document.querySelector('.canvas-editor')

const options = {
  width: 816,
  height: 1056,
  mode: EditorMode.EDIT,
  pageMode: PageMode.PAGING,
  pageNumber: { format: '{pageNo}/{pageCount}' },
  minSize: 1,
  maxSize: 72,
}

const editor = new Editor(container, [], options)
```

Wire DOM handlers into your own toolbar:

```jsx
import { DOMEventHandlers } from '@mindfiredigital/canvas-editor'

<ButtonWrapper title="bold"      handleClick={DOMEventHandlers.handleBold}><FormatBoldIcon /></ButtonWrapper>
<ButtonWrapper title="italic"    handleClick={DOMEventHandlers.handleItalic}><FormatItalicIcon /></ButtonWrapper>
<ButtonWrapper title="underline" handleClick={DOMEventHandlers.handleUnderline}><FormatUnderlinedIcon /></ButtonWrapper>
```

## API

### Exports

Named exports from `@mindfiredigital/canvas-editor`:

| Symbol | Kind | Purpose |
|---|---|---|
| `Editor` (default) | class | Main editor constructor |
| `DOMEventHandlers` | object | Toolbar action handlers (see below) |
| `EditorMode` | enum | `EDIT` / `READONLY` / `FORM` / etc. |
| `PageMode` | enum | `PAGING` / `CONTINUITY` |
| `ElementType` | enum | Element kinds (`TEXT`, `IMAGE`, `TABLE`, …) |
| `ControlType` | enum | Form control types |
| `RowFlex` / `VerticalAlign` | enum | Alignment |
| `ListType` / `ListStyle` | enum | List variants |
| `BlockType`, `TitleLevel`, `NumberType` | enum | Block-level formatting |
| `ImageDisplay`, `WordBreak`, `TableBorder` | enum | Visual options |
| `PaperDirection`, `MaxHeightRatio` | enum | Page setup |
| `Command`, `KeyMap` | enum | Commands & shortcuts |
| `EditorZone`, `EditorComponent`, `EDITOR_COMPONENT` | enum/const | Zone identifiers |

Type-only exports: `IElement`, `IEditorData`, `IEditorOption`, `IEditorResult`, `IContextMenuContext`, `IRegisterContextMenu`, `IWatermark`, `INavigateInfo`, `IBlock`, `ILang`, `ICatalog`, `ICatalogItem`, `IRangeStyle`.

### DOM Handlers

All exposed through `DOMEventHandlers.*`.

| Handler | Description |
|---|---|
| `handleUndo` | Undo previous action |
| `handleRedo` | Redo previously undone action |
| `handleBold` | Toggle bold on selection |
| `handleItalic` | Toggle italic on selection |
| `handleUnderline` | Toggle underline on selection |
| `handleStrikeout` | Toggle strikeout on selection |
| `handleSuperscript` | Toggle superscript on selection |
| `handleSubscript` | Toggle subscript on selection |
| `handleFontFamily` | Change font family on selection |
| `handleAlign` | Align left / center / right / justify |
| `handleList` | Create bulleted or numbered list |
| `setFontColor` | Set font color on selection |
| `highlightText` | Toggle highlight on selection |
| `setFont` | Set font of selection |
| `setSize` | Set font size of selection |
| `increaseFontSize` | Increment font size |
| `decreaseFontSize` | Decrement font size |
| `getContent` | Read editor content |
| `setContent` | Replace editor content |
| `createTable` | Insert a table |
| `setTitle` | Set document title |
| `getContentStyles` | Read computed content styles |
| `setImage` | Insert an image |
| `createHyperLink` | Insert a hyperlink |
| `setHorizontalLine` | Insert a horizontal line |
| `setPaperMargins` | Set paper margins |
| `getSelectedText` | Read selected text |
| `insertElement` | Insert a custom element |

## Documentation

Full guides, references, and contribution docs live in the [Canvas Editor docs site](https://mindfiredigital.github.io/canvas-editor/).

- [What is Canvas Editor](https://mindfiredigital.github.io/canvas-editor/docs/what-is-canvas-editor)
- [Installation](https://mindfiredigital.github.io/canvas-editor/docs/Get-started/Installation)
- [Quick start](https://mindfiredigital.github.io/canvas-editor/docs/Get-started/quickstart)
- [DOM events reference](https://mindfiredigital.github.io/canvas-editor/docs/references/dom-event)

## Contributing

Pull requests and issues are welcome. See the [contributing guide](https://mindfiredigital.github.io/canvas-editor/docs/contributors/how-to-contribute) and [code of conduct](https://mindfiredigital.github.io/canvas-editor/docs/contributors/code-of-conduce) before opening a PR.

Local development:

```bash
git clone https://github.com/mindfiredigital/canvas-editor.git
cd canvas-editor
npm install
npm run dev          # launch demo app
npm run lib          # build library bundle
npm run cypress:open # run e2e tests
```

## License

[MIT](./LICENSE) © Mindfire Digital LLP.
