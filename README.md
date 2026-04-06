<h1 align="center">AsterMode 🌸</h1>

<p align="center">
  A lightweight Vite plugin that injects a draggable <strong>Dev Mode</strong> overlay for local debugging.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/astermode">
    <img src="https://img.shields.io/npm/v/astermode?style=flat-square" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/astermode">
    <img src="https://img.shields.io/npm/dm/astermode?style=flat-square" alt="npm downloads" />
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="license" />
  </a>
  <img src="https://img.shields.io/badge/vite-plugin-646CFF?style=flat-square&logo=vite&logoColor=white" alt="vite plugin" />
  <img src="https://img.shields.io/badge/dev-only-orange?style=flat-square" alt="dev only" />
</p>

## Overview

`AsterMode` is designed for Vite development workflows. During `vite dev`, it injects a visual overlay to help with UI inspection and debugging. It does not run in production builds.

## Features

- Floating, draggable **AsterMode** trigger button (clamped to viewport bounds)
- Bottom dev toolbar with quick actions:
  - Hover border toggle (`ON/OFF`)
  - Clear `localStorage`
  - Clear `sessionStorage`
  - Clear cookies
  - Cache toggle (`ON/OFF`) with request no-cache behavior
  - Theme switch (`Light` / `Dark`)
  - Reload page
  - Close panel
- Panel visibility state persistence across reloads (`localStorage`)
- Hover inspection:
  - element outline (1px)
  - live width/height tooltip
  - excludes AsterMode UI from hover targeting
- Right-click element while hover mode is on:
  - opens **Live HTML Editor** for the selected element
  - loads full element markup (`outerHTML`, including container tag)
  - formatted/indented HTML editing
  - apply edits by replacing the selected node in-place
- Built-in third-party HTML editor integration (CodeMirror) with textarea fallback
- Theme-adaptive editor and toolbar styling (auto + manual theme mode)
- Vite dev-only runtime injection (`apply: "serve"`)
- TypeScript-authored with JS-compatible runtime and type declarations

## Installation

```bash
npm install --save-dev astermode
```

## Quick Start

### TypeScript (`vite.config.ts`)

```ts
import { defineConfig } from "vite";
import astermode from "astermode";

export default defineConfig({
  plugins: [astermode()]
});
```

### JavaScript (`vite.config.js`)

```js
import { defineConfig } from "vite";
import astermode from "astermode";

export default defineConfig({
  plugins: [astermode()]
});
```

Run your app:

```bash
npm run dev
```

## Configuration

`astermode` accepts a single options object:

```ts
astermode({
  enabled: true,
  cacheBypassDefault: false
});
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Enables or disables overlay injection in dev mode. |
| `cacheBypassDefault` | `boolean` | `false` | Starts AsterMode with cache bypass enabled (`Cache: OFF`). |

## Behavior Notes

- Built specifically for Vite projects
- Injected only in `serve` mode
- Not intended as a CDN/global script include
- UI state uses browser `localStorage` keys:
  - `astermode:panel-open`
  - `astermode:theme`

## License

MIT

## Example (Vite + React)

A runnable example is available in `examples/vite-react`.

```bash
cd examples/vite-react
npm install
npm run dev
```
