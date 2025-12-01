---
title: Content Script
tags: [content-script, injection, dom]
date: 2025-12-01
---

# Content Script

## Purpose

Injects code into web pages to interact with page DOM and content.

## Implementation (`entrypoints/content.ts`)

```typescript
export default defineContentScript({
  matches: ["*://*.google.com/*"],
  main() {
    console.log("Hello content.");
  },
});
```

## Configuration

### matches

Array of URL patterns where script will inject:

- `*://*.google.com/*` - All Google.com pages
- `<all_urls>` - All websites (use with caution)
- `https://example.com/*` - Specific domain

### run_at (optional)

- `document_start` - Before DOM loads
- `document_end` - After DOM loads (default)
- `document_idle` - After page fully loaded

## Capabilities

- Access to page DOM
- Can inject UI elements
- Can listen to page events
- Can communicate with background script
- Isolated JavaScript context (safe from page scripts)

## Common Use Cases

- Modify page content
- Extract data from pages
- Inject custom UI
- Monitor page events
- Intercept network requests (with declarativeNetRequest)

## Communication

### To Background Script

```typescript
const response = await browser.runtime.sendMessage({
  type: "DATA_FROM_PAGE",
  data: extractedData,
});
```

### From Background Script

```typescript
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "UPDATE_PAGE") {
    // Update page content
    sendResponse({ success: true });
  }
});
```

## Reference

See [[background-script]], [[wxt-configuration]]
