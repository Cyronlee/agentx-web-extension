---
title: Memory Index
date: 2025-12-01
---

# AgentX Web Extension - Memory Index

## Core Documentation

### Project Foundation

- [[project-overview]] - Project purpose, features, and architecture
- [[tech-stack]] - Complete technology stack and dependencies
- [[directory-structure]] - File organization and conventions

### Configuration & Setup

- [[wxt-configuration]] - WXT framework setup and manifest
- [[runtime-config]] - Runtime configuration with environment variables

### Architecture & Patterns

- [[storage-pattern]] - WXT Storage API and persistence patterns
- [[component-patterns]] - React component structure and shadcn/ui usage
- [[theme-system]] - Theme management (System/Light/Dark)

### Extension Components

- [[background-script]] - Background service worker lifecycle
- [[content-script]] - Content script injection and page interaction

## Quick Reference

**Package Manager**: pnpm v9.10.0  
**Framework**: WXT v0.20.6  
**React**: v19.1.0  
**TypeScript**: v5.8.3  
**Tailwind CSS**: v4.1.11

**Key Commands**:

- `pnpm dev` - Development mode
- `pnpm build` - Production build
- `pnpm zip` - Create distribution

**Key Files**:

- `wxt.config.ts` - WXT configuration
- `app.config.ts` - Runtime configuration
- `entrypoints/` - Extension entry points
- `components/ui/` - shadcn/ui components
