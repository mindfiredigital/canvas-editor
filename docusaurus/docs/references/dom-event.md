---
sidebar_position: 1
---

# DOM Events

`DOMEventHandlers` is the public surface for toolbar actions. Import it once and bind any method to your own buttons — no framework coupling.

## Import

```js
import { DOMEventHandlers } from '@mindfiredigital/canvas-editor'
```

:::info Usage
Handlers act on the active editor instance. Mount the editor (see [Quick Start](../Get-started/quickstart)) before invoking handlers.
:::

## Handlers

### History

| Handler | Description |
|---|---|
| `handleUndo` | Undo the previous action |
| `handleRedo` | Redo a previously undone action |

### Inline Formatting

| Handler | Description |
|---|---|
| `handleBold` | Toggle **bold** on the selection |
| `handleItalic` | Toggle *italic* on the selection |
| `handleUnderline` | Toggle underline on the selection |
| `handleStrikeout` | Toggle strikeout on the selection |
| `handleSuperscript` | Toggle superscript on the selection |
| `handleSubscript` | Toggle subscript on the selection |

### Typography

| Handler | Description |
|---|---|
| `handleFontFamily` | Set the font family on the selection |
| `setFont` | Set the font of the selection |
| `setSize` | Set the font size of the selection |
| `increaseFontSize` | Increment font size by one step |
| `decreaseFontSize` | Decrement font size by one step |
| `setFontColor` | Set font color on the selection |
| `highlightText` | Toggle highlight on the selection |

### Block Formatting

| Handler | Description |
|---|---|
| `handleAlign` | Align selection: left, center, right, or justify |
| `handleList` | Convert selection into a bulleted or numbered list |
| `setHorizontalLine` | Insert a horizontal line |

### Content

| Handler | Description |
|---|---|
| `getContent` | Read editor content |
| `setContent` | Replace editor content |
| `getContentStyles` | Read computed content styles |
| `getSelectedText` | Read the currently selected text |
| `setTitle` | Set the document title |
| `setPaperMargins` | Set the paper margins |

### Insertion

| Handler | Description |
|---|---|
| `createTable` | Insert a table |
| `setImage` | Insert an image |
| `createHyperLink` | Insert a hyperlink |
| `insertElement` | Insert a custom element |

## Example

```jsx
import { DOMEventHandlers } from '@mindfiredigital/canvas-editor'

<button onClick={DOMEventHandlers.handleBold}>B</button>
<button onClick={() => DOMEventHandlers.setSize(14)}>14pt</button>
<button onClick={() => DOMEventHandlers.createTable(3, 3)}>Insert 3×3 table</button>
```

## Next Steps

- [Quick Start](../Get-started/quickstart) — wire handlers into a toolbar
- [Release Notes](../release/release-notes) — versioning and publish flow
