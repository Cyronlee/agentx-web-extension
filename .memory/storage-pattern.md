---
title: Storage Pattern
tags: [storage, state, persistence]
date: 2025-12-01
---

# Storage Pattern

## WXT Storage API Usage

### Defining Storage Items
```typescript
import { storage } from '#imports'

const appearanceSettings = storage.defineItem<AppearanceSettings>('local:appearanceSettings', {
  fallback: { theme: 'system' }
})
```

### Storage Keys
- `local:appearanceSettings` - Theme preference
- `local:systemSettings` - Notifications, sync interval
- `local:uiSettings` - Active tab state

## Settings Hook Pattern

The `useSettings()` hook in `hooks/use-settings.ts` implements:

1. **State Management**: Local React state for UI reactivity
2. **Persistence**: WXT Storage for cross-session persistence
3. **Loading State**: Async loading with loading flag
4. **Update Functions**: Type-safe partial updates
5. **Reset Function**: Clear storage and restore defaults

### Key Implementation Details
```typescript
// Load on mount
useEffect(() => {
  const [appearanceData, systemData, uiData] = await Promise.all([
    appearanceSettings.getValue(),
    systemSettings.getValue(),
    uiSettings.getValue()
  ])
  setAppearance(appearanceData)
  setSystem(systemData)
  setUI(uiData)
}, [])

// Update with persistence
const updateAppearance = async (updates: Partial<AppearanceSettings>) => {
  const newSettings = { ...appearance, ...updates }
  setAppearance(newSettings)  // Update UI immediately
  await appearanceSettings.setValue(newSettings)  // Persist
}
```

## Storage Benefits
- Type-safe with TypeScript
- Fallback values for first-time users
- Cross-context (background ↔ sidepanel) synchronization
- Browser-agnostic (works on Chrome, Firefox, etc.)

## Reference
See [[wxt-configuration]], [[component-patterns]]

