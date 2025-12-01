---
title: Background Script
tags: [background, service-worker, lifecycle]
date: 2025-12-01
---

# Background Script

## Purpose

Service worker that manages extension lifecycle and browser events.

## Implementation (`entrypoints/background.ts`)

```typescript
export default defineBackground(() => {
  // Extension icon click → open sidepanel
  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      await browser.sidePanel.open({ tabId: tab.id });
    }
  });

  // Setup on install
  browser.runtime.onInstalled.addListener(async () => {
    await browser.sidePanel.setOptions({
      path: "sidepanel.html",
      enabled: true,
    });

    await browser.sidePanel.setPanelBehavior({
      openPanelOnActionClick: true,
    });
  });
});
```

## Key Responsibilities

1. **Icon Click Handler**: Opens sidepanel when user clicks extension icon
2. **Installation Setup**: Configures sidepanel on first install/update
3. **Lifecycle Management**: Runs in background, survives page navigations

## Background Context

- Runs as service worker (Manifest V3) or background page (Manifest V2)
- No DOM access (use content scripts for page interaction)
- Can communicate with sidepanel via `browser.runtime.sendMessage()`
- Has access to all extension APIs

## Communication Patterns

### Background → Sidepanel

```typescript
browser.runtime.sendMessage({ type: 'UPDATE_DATA', data: ... })
```

### Sidepanel → Background

```typescript
const response = await browser.runtime.sendMessage({ type: "GET_DATA" });
```

## Reference

See [[content-script]], [[wxt-configuration]]
