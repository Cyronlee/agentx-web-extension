---
title: Runtime Configuration
tags: [config, environment, runtime]
date: 2025-12-01
---

# Runtime Configuration

## app.config.ts Pattern

WXT provides runtime configuration system with type safety.

### Configuration Definition

```typescript
import { defineAppConfig } from "#imports";

// Type augmentation
declare module "wxt/utils/define-app-config" {
  export interface WxtAppConfig {
    features?: {
      enableChat?: boolean;
      maxTokens?: number;
    };
  }
}

export default defineAppConfig({
  features: {
    enableChat: import.meta.env.WXT_ENABLE_CHAT === "true" || true,
    maxTokens: parseInt(import.meta.env.WXT_MAX_TOKENS || "1000"),
  },
});
```

## Environment Variables

### Naming Convention

- Prefix with `WXT_` for WXT environment variables
- Access via `import.meta.env.WXT_*`

### Usage in Components

```typescript
import { useAppConfig } from "#imports";

function App() {
  const config = useAppConfig();

  return (
    <Badge variant={config.features?.enableChat ? "default" : "secondary"}>
      {config.features?.enableChat ? "Enabled" : "Disabled"}
    </Badge>
  );
}
```

## Benefits

1. **Type Safety**: TypeScript knows config structure
2. **Auto-complete**: IDE suggestions for config properties
3. **Runtime Access**: Available in all entry points and components
4. **Environment-based**: Different values for dev/prod
5. **Reactive**: `useAppConfig()` hook for components

## Common Use Cases

- Feature flags (enable/disable features)
- API endpoints (dev vs prod URLs)
- Limits and quotas (rate limits, token limits)
- Debug settings (logging levels)

## Reference

See [[wxt-configuration]]
