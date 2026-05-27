---
sidebar_position: 1
---

# Installation

`@mindfiredigital/canvas-editor` ships as a single npm package. Source lives at [github.com/mindfiredigital/canvas-editor](https://github.com/mindfiredigital/canvas-editor).

## Prerequisites

- **Node.js** `16.14` or higher for build tooling. The published bundle runs in any modern browser (ES2015+).
- A bundler that handles ES modules (Vite, webpack 5, Rollup, esbuild, Parcel, Next.js, CRA, etc.).
- A package manager: **npm**, **yarn**, or **pnpm**.

## Install

Pick the package manager you use:

**npm**

```bash
npm install @mindfiredigital/canvas-editor
```

**yarn**

```bash
yarn add @mindfiredigital/canvas-editor
```

**pnpm**

```bash
pnpm add @mindfiredigital/canvas-editor
```

:::info Public Scope
The package is published under the public scope `@mindfiredigital` on the npm registry — no auth token needed.
:::

## What's in the Bundle

| File | Format | Purpose |
|---|---|---|
| `dist/canvas-editor.es.js` | ESM | Default `module` entry — used by modern bundlers |
| `dist/canvas-editor.umd.js` | UMD | Default `main` entry — Node / legacy bundlers |
| `dist/src/editor/index.d.ts` | TypeScript types | IDE autocomplete and type-checking |

:::tip CSS Injection
CSS is injected automatically by the bundle — no separate stylesheet import required.
:::

## Verify the Install

```js
import Editor from '@mindfiredigital/canvas-editor'
console.log(typeof Editor) // "function"
```

If the import resolves and logs `"function"`, you're ready to mount the editor.

## Next Steps

- [Quick Start](./quickstart) — mount the editor in your app
- [DOM Events](../references/dom-event) — full toolbar handler reference
