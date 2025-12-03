---
title: Memory Index
date: 2025-12-03
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

### AI & Backend

- [[ai-sdk-integration]] - AI SDK chat with persistence
- [[backend]] - Express backend server
- [[mcp-integration]] - MCP tools with human-in-the-loop

## Quick Reference

**Package Manager**: pnpm v9.10.0  
**Framework**: WXT v0.20.6  
**React**: v19.1.0  
**TypeScript**: v5.8.3  
**Tailwind CSS**: v4.1.11

**Key Commands**:

- `pnpm dev` - Extension development mode
- `pnpm build` - Extension production build
- `pnpm zip` - Create distribution
- `pnpm backend:dev` - Start backend server
- `pnpm backend:install` - Install backend dependencies

**Key Files**:

- `wxt.config.ts` - WXT configuration
- `app.config.ts` - Runtime configuration
- `entrypoints/` - Extension entry points
- `components/ui/` - shadcn/ui components
- `backend/` - Express backend server

**Architecture**:

```
┌─────────────────────┐     ┌─────────────────────┐
│   Browser Extension │     │   Backend Server    │
│   (React + WXT)     │────►│   (Express + AI SDK)│
│                     │     │                     │
│  - Sidepanel UI     │     │  - /api/chat        │
│  - Settings         │     │  - MCP Clients      │
│  - IndexedDB        │     │  - HITL Processing  │
└─────────────────────┘     └─────────────────────┘
```
