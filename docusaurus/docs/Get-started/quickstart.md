---
sidebar_position: 2
---

# Quick Start

Mount Canvas Editor in under 5 minutes.

## Prerequisites

- `@mindfiredigital/canvas-editor` installed — see [Installation](./Installation).
- A DOM container element where the editor will render.

## 1. Install

```bash
npm install @mindfiredigital/canvas-editor
```

## 2. Vanilla JS

```html
<div class="canvas-editor"></div>
```

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

## 3. React — Editor Component

`CanvasEditor.jsx` — mounts the editor on a DOM node and stores the instance on a ref.

```jsx
import { useEffect, useRef } from 'react'
import Editor, { EditorMode, PageMode } from '@mindfiredigital/canvas-editor'

export default function CanvasEditor({ editorRef }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const options = {
      width: 816,
      height: 1056,
      mode: EditorMode.EDIT,
      pageMode: PageMode.PAGING,
      pageNumber: { format: '{pageNo}/{pageCount}' },
      minSize: 1,
      maxSize: 72,
    }
    editorRef.current = new Editor(containerRef.current, [], options)
  }, [editorRef])

  return <div ref={containerRef} className="canvas-editor" />
}
```

## 4. React — Toolbar

`Toolbar.jsx` — wires `DOMEventHandlers` to your own buttons.

```jsx
import { DOMEventHandlers } from '@mindfiredigital/canvas-editor'

export default function Toolbar() {
  return (
    <>
      <button title="bold"      onClick={DOMEventHandlers.handleBold}>B</button>
      <button title="italic"    onClick={DOMEventHandlers.handleItalic}>I</button>
      <button title="underline" onClick={DOMEventHandlers.handleUnderline}>U</button>
    </>
  )
}
```

## 5. Compose

```jsx
import { useRef } from 'react'
import CanvasEditor from './CanvasEditor'
import Toolbar from './Toolbar'

export default function DocumentEditor() {
  const editorRef = useRef(null)
  return (
    <>
      <Toolbar />
      <CanvasEditor editorRef={editorRef} />
    </>
  )
}
```

:::tip Editor Instance
Keep a ref to the `Editor` instance to call programmatic APIs later (set content, get content, focus, etc.).
:::

## Next Steps

- [DOM Events](../references/dom-event) — the complete handler reference
- [How to Contribute](../contributors/how-to-contribute) — file an issue or open a PR
