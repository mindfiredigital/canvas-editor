---
sidebar_position: 1
---

# How to Contribute

Thanks for your interest in **Canvas Editor**. Pull requests, issues, and design feedback are all welcome. This guide walks through the workflow used to keep contributions aligned with project goals and quality standards.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Setup Steps](#setup-steps)
- [Branch Naming Convention](#branch-naming-convention)
- [Development Workflow](#development-workflow)
- [Commit & PR Process](#commit--pr-process)
- [Code Review](#code-review)
- [Code of Conduct](#code-of-conduct)
- [Licensing](#licensing)

## Overview

Canvas Editor is a canvas/SVG-based rich text editor maintained by Mindfire Digital. Contributions follow a structured workflow: fork → branch → implement → test → PR against `dev`. Maintainers review submissions and merge once checks pass. Releases are cut from `dev` to `main`.

## Prerequisites

- **Git** and a **GitHub** account
- **Node.js** LTS (`>=16.14`, the `engines` field requires `>=12.0.0` but LTS is recommended)
- **npm** (bundled with Node.js) — this project uses npm scripts; a `yarn` lockfile is also present
- A modern browser for running the demo app

## Setup Steps

1. **Fork and Clone**

   Fork [`mindfiredigital/canvas-editor`](https://github.com/mindfiredigital/canvas-editor) on GitHub, then clone your fork:

   ```bash
   git clone https://github.com/your-username/canvas-editor.git
   cd canvas-editor
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Run the Demo App**

   ```bash
   npm run dev
   ```

   Vite serves the editor at `http://localhost:3000` (or the next free port).

4. **Run End-to-End Tests**

   ```bash
   npm run cypress:open     # interactive
   npm run cypress:run      # headless
   ```

5. **Build the Library / App**

   ```bash
   npm run lib              # library build
   npm run build            # demo app build
   ```

## Branch Naming Convention

- Features: `feature/short-feature-description` (e.g. `feature/table-cell-merge`)
- Fixes: `fix/short-bug-description` (e.g. `fix/bold-toggle-state`)
- Docs: `docs/short-description`
- Chore: `chore/short-description`

Branch off `dev`, not `main`.

## Development Workflow

1. **Pick an issue** from the [issue tracker](https://github.com/mindfiredigital/canvas-editor/issues). Look for `good first issue` labels. For new features, open an issue first to align on scope.
2. **Create a branch** from `dev` using the naming convention above.
3. **Implement the change** in `src/`. Keep changes focused; one logical change per PR.
4. **Add or update Cypress tests** in `cypress/` when behavior changes.
5. **Lint and type-check** before committing:

   ```bash
   npm run lint
   npm run type:check
   ```

6. **Update documentation** in `docusaurus/docs/` when public API or behavior changes.

## Commit & PR Process

- Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.
- Examples:
  - `feat(table): add cell merge support`
  - `fix(toolbar): correct bold toggle state on selection`
  - `docs(contrib): clarify cypress setup`
- Base all PRs against the **`dev`** branch. Releases promote `dev` → `main`.
- PR description must include:
  - **What** changed and **why**
  - Linked issue (e.g. `Closes #123`)
  - Screenshots or screen recordings for UI changes
  - Test plan / verification steps
- Push updates to the same branch; the PR refreshes automatically.

## Code Review

Maintainers review submissions for correctness, scope, style, and test coverage. Address review comments on the same branch — pushed commits reflect in the PR automatically. CI must be green before merge.

## Code of Conduct

Participation is governed by our [Code of Conduct](./code-of-conduce). Be respectful in issues, PRs, and reviews.

## Licensing

Canvas Editor is released under the [MIT License](https://github.com/mindfiredigital/canvas-editor/blob/main/LICENSE). By submitting a contribution, you agree your work is licensed under the same terms.
