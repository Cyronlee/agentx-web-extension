---
title: Component Patterns
tags: [react, components, shadcn]
date: 2025-12-01
---

# Component Patterns

## Main App Structure

The sidepanel App.tsx follows this pattern:

```
<div> (full screen container)
  ├── <Header> (fixed)
  ├── <Tabs> (flex-1 with overflow)
      ├── <TabsList> (sticky tabs)
      └── <TabsContent>
          └── <ScrollArea> (scrollable content)
```

## Key Patterns

### 1. Full-Height Layout
```tsx
<div className="flex flex-col h-screen bg-background">
  <div className="border-b px-4 py-3">{/* Header */}</div>
  <div className="flex-1 overflow-hidden">{/* Content */}</div>
</div>
```

### 2. Tabs with ScrollArea
```tsx
<TabsContent value="settings" className="flex-1 overflow-hidden">
  <ScrollArea className="h-full">
    <div className="space-y-6 p-4">{/* Content */}</div>
  </ScrollArea>
</TabsContent>
```

### 3. Settings Row Pattern
```tsx
<div className="flex items-center justify-between">
  <div>
    <Label>Title</Label>
    <p className="text-xs text-muted-foreground">Description</p>
  </div>
  <Switch checked={value} onCheckedChange={handler} />
</div>
```

## shadcn/ui Components

### Adding New Components
```bash
pnpm dlx shadcn@latest add dialog
```

Components are added to `components/ui/` with:
- Tailwind styling
- CSS variables for theming
- Radix UI primitives
- TypeScript types

### Styling Conventions
- Use semantic color classes: `text-muted-foreground`, `bg-primary`
- Spacing: `space-y-4`, `gap-2`
- Borders: `border`, `border-b`
- Responsive: built-in in sidepanel (fixed width)

## Custom Hooks Integration

```tsx
const { appearance, updateAppearance } = useSettings()
const { resolvedTheme, setTheme } = useTheme({
  theme: appearance.theme,
  onThemeChange: (theme) => updateAppearance({ theme })
})
```

## Reference
See [[storage-pattern]], [[theme-system]]

