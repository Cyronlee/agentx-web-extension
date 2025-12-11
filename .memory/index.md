---
title: Memory Index
date: 2025-12-05
---

# AgentX Web Extension - Memory Index

## Core Documentation

- [[project-overview]] - Project purpose and architecture
- [[tech-stack]] - Technology stack and dependencies
- [[directory-structure]] - File organization

## Architecture

- [[backend]] - Express backend with AI SDK
- [[ai-sdk-integration]] - Chat persistence and streaming
- [[mcp-integration]] - MCP tools with human-in-the-loop
- [[agents]] - Agent management with custom prompts and MCP configs

## Quick Reference

**Stack**: WXT + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui

**Commands**:

```bash
pnpm dev              # Extension dev mode
pnpm build            # Extension production build
pnpm backend:dev      # Start backend server
```

**Architecture**:

```
┌─────────────────────┐     ┌─────────────────────┐
│   Browser Extension │     │   Backend Server    │
│   (React + WXT)     │────►│   (Express + AI SDK)│
│                     │     │                     │
│  - Sidepanel UI     │     │  - /api/chat        │
│  - IndexedDB        │     │  - MCP Clients      │
│  - Settings Storage │     │  - HITL Processing  │
└─────────────────────┘     └─────────────────────┘
```

**Key Files**:

- `wxt.config.ts` - WXT manifest config
- `app.config.ts` - Runtime config
- `entrypoints/` - Extension entry points
- `backend/` - Express server
