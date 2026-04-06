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

- Draggable **Dev Mode** indicator
- Context menu actions:
  - toggle hover borders
  - clear local storage
- Live element size tooltip (`width` and `height`)
- Vite dev-only HTML injection (`serve` mode)
- TypeScript-authored with compatibility for TS and JS consumers

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
  enabled: true
});
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Enables or disables overlay injection in dev mode. |

## Behavior Notes

- Built specifically for Vite projects
- Injected only in `serve` mode
- Not intended as a CDN/global script include

## License

MIT

## Example (Vite + React)

A runnable example is available in `examples/vite-react`.

```bash
cd examples/vite-react
npm install
npm run dev
```
