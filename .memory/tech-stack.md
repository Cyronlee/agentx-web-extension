---
title: Tech Stack
tags: [stack, dependencies, tools]
date: 2025-12-01
---

# Tech Stack

## Core Framework

- **WXT** (v0.20.6) - Next-gen Web Extension Framework with hot reload
- **React** (v19.1.0) - UI library with latest features
- **TypeScript** (v5.8.3) - Type-safe development

## Build & Package Management

- **pnpm** (v9.10.0) - Fast, disk-efficient package manager
- **Vite** - Modern build tool (via WXT)

## Styling

- **Tailwind CSS** (v4.1.11) - Latest version with new CSS-first configuration
- **@tailwindcss/vite** (v4.1.11) - Vite plugin for Tailwind CSS 4.0
- **tw-animate-css** (v1.3.4) - Animation utilities

## UI Components

- **shadcn/ui** - Component system based on:
  - **Radix UI** - Unstyled, accessible components (@radix-ui/react-\*)
  - **lucide-react** (v0.525.0) - Icon library
  - **class-variance-authority** (v0.7.1) - Component variants
  - **clsx** + **tailwind-merge** - Class name utilities

## WXT Modules

- **@wxt-dev/module-react** (v1.1.3) - React integration for WXT

## Browser APIs Used

- `browser.sidePanel` - Sidepanel API
- `browser.action` - Extension action (icon click)
- `browser.storage` - Persistent storage (via WXT Storage wrapper)
- `browser.runtime` - Extension lifecycle events

## Development Tools

- TypeScript compiler with strict mode
- WXT dev server with hot module replacement

## Reference

See [[project-overview]], [[wxt-configuration]]
