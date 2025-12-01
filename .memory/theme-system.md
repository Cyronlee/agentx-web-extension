---
title: Theme System
tags: [theme, dark-mode, styling]
date: 2025-12-01
---

# Theme System

## Theme Architecture

Three-mode system: System, Light, Dark

## Implementation

### 1. Theme Hook (`use-theme.ts`)

```typescript
type Theme = "system" | "light" | "dark";

function useTheme({ theme, onThemeChange }) {
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Resolve theme: 'system' → actual OS theme
  const resolveTheme = (currentTheme: Theme) => {
    if (currentTheme === "system") return getSystemTheme();
    return currentTheme;
  };

  // Apply to DOM
  const updateDocumentTheme = (isDark: boolean) => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };
}
```

### 2. System Theme Detection

```typescript
const getSystemTheme = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};
```

### 3. System Theme Listener

Automatically updates when OS theme changes (only when theme is 'system'):

```typescript
useEffect(() => {
  if (theme !== "system") return;
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", handleSystemThemeChange);
  return () =>
    mediaQuery.removeEventListener("change", handleSystemThemeChange);
}, [theme]);
```

## Tailwind CSS Integration

### Dark Mode Configuration

Tailwind uses class-based dark mode:

```css
/* Light mode */
.text-foreground {
  color: var(--foreground);
}

/* Dark mode */
.dark .text-foreground {
  color: var(--foreground);
}
```

### CSS Variables

Defined in `assets/tailwind.css`:

- Light mode: `:root { --background: ...; }`
- Dark mode: `.dark { --background: ...; }`

## Usage in Components

```tsx
const themeOptions = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon }
]

<Button
  variant={appearance.theme === option.value ? "default" : "outline"}
  onClick={() => setTheme(option.value)}
>
  <Icon />
  {option.label}
</Button>
```

## Reference

See [[component-patterns]], [[storage-pattern]]
