---
title: Iconify Integration
tags: [ui, icons, lucide]
date: 2024-12-08
---

# Iconify Integration

This project uses Iconify for icon rendering, specifically with the Lucide icon set.

## Dependencies

- `@iconify/react` - React component for rendering Iconify icons
- `@iconify-json/lucide` - Lucide icon collection for Iconify

## Setup

Iconify is initialized in `entrypoints/sidepanel/main.tsx`:

```typescript
import { addCollection } from '@iconify/react'
import { icons as lucide } from '@iconify-json/lucide'

// Initialize Iconify with Lucide icons
addCollection(lucide)
```

## Usage

```tsx
import { Icon } from '@iconify/react'

// Basic usage
<Icon icon="lucide:circle-user" />

// With styling
<Icon icon="lucide:check" className="w-4 h-4 text-green-500" />

// With animation
<Icon icon="lucide:loader-2" className="h-4 w-4 animate-spin" />
```

## Icon Format

- All Lucide icons are prefixed with `lucide:`
- Icon names use kebab-case (e.g., `lucide:check-circle`, `lucide:x-circle`)
- Browse available icons at: https://lucide.dev/icons/

## Benefits

1. **Tree-shakeable** - Only icons used are included in the bundle
2. **Consistent** - All icons come from the same Lucide set
3. **Type-safe** - TypeScript support built-in
4. **Flexible** - Easy to style with Tailwind classes


## Migration from lucide-react

When migrating from direct `lucide-react` imports:

```tsx
// Old
import { Server, CheckCircle } from 'lucide-react'
<Server className="h-4 w-4" />

// New
import { Icon } from '@iconify/react'
<Icon icon="lucide:server" className="h-4 w-4" />
```

Note: Both approaches are supported in this project. Use Iconify for new components, but existing lucide-react imports don't need to be changed.

