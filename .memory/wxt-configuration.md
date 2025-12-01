---
title: WXT Configuration
tags: [wxt, config, manifest]
date: 2025-12-01
---

# WXT Configuration

## wxt.config.ts Structure

```typescript
import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  alias: { "@": path.resolve(__dirname, "./") },
  vite: () => ({ plugins: [tailwindcss()] }),
  manifest: {
    permissions: ["sidePanel", "storage"],
    side_panel: { default_path: "sidepanel.html" },
    action: { default_title: "Open Sidepanel" },
  },
});
```

## Key Configurations

### Modules

- `@wxt-dev/module-react` - Enables React support with auto-imports

### Alias

- `@/` resolves to project root for clean imports

### Vite Plugin

- `@tailwindcss/vite` - Required for Tailwind CSS 4.0

### Manifest Permissions

- `sidePanel` - Required for sidepanel API
- `storage` - For persistent data storage

### Sidepanel Config

- `default_path: 'sidepanel.html'` - Entry HTML for sidepanel
- `openPanelOnActionClick: true` - Set programmatically in background script

## Auto-imports from WXT

- `defineBackground()`, `defineContentScript()` - Entry point wrappers
- `storage` - Storage API wrapper
- `browser` - Cross-browser WebExtension API
- `useAppConfig()` - Runtime config hook

## Build Commands

- `pnpm dev` - Development with hot reload (Chrome)
- `pnpm dev:firefox` - Firefox development
- `pnpm build` - Production build
- `pnpm zip` - Create distribution archives

## Reference

See [[tech-stack]], [[storage-pattern]]
