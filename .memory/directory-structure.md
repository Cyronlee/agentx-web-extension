---
title: Directory Structure
tags: [structure, organization, folders]
date: 2025-12-01
---

# Directory Structure

```
agentx-web-extension/
├── entrypoints/              # WXT entry points (auto-discovered)
│   ├── background.ts         # Service worker - handles extension lifecycle
│   ├── content.ts            # Content script - injected into web pages
│   └── sidepanel/            # Sidepanel UI entry point
│       ├── App.tsx           # Main React app with tabs
│       ├── main.tsx          # React DOM root
│       └── index.html        # HTML template
├── components/               # React components
│   └── ui/                   # shadcn/ui components (auto-generated)
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── scroll-area.tsx
│       ├── separator.tsx
│       ├── switch.tsx
│       └── tabs.tsx
├── hooks/                    # Custom React hooks
│   ├── use-settings.ts       # Settings state + WXT Storage
│   ├── use-theme.ts          # Theme management
│   └── use-mobile.ts         # Mobile detection (unused in sidepanel)
├── lib/                      # Utility functions
│   └── utils.ts              # cn() for class merging
├── assets/                   # Static assets
│   ├── tailwind.css          # Global styles + Tailwind imports
│   └── react.svg
├── public/                   # Public assets (copied to build)
│   ├── icon/                 # Extension icons (16, 32, 48, 96, 128)
│   └── wxt.svg
├── .memory/                  # Project memory files (AI context)
├── app.config.ts             # Runtime configuration with env vars
├── wxt.config.ts             # WXT framework configuration
├── components.json           # shadcn/ui configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project metadata & scripts
```

## Key Conventions

- **Entry points**: Files in `entrypoints/` are auto-discovered by WXT
- **Manifest generation**: WXT auto-generates manifest.json from config
- **Build output**: `.output/` directory (gitignored)
- **Aliases**: `@/` → project root

## Reference

See [[project-overview]], [[wxt-configuration]], [[component-patterns]]
