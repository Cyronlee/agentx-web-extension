---
title: Directory Structure
tags: [structure, organization]
date: 2025-12-05
---

# Directory Structure

```
agentx-web-extension/
├── entrypoints/              # WXT entry points
│   ├── background.ts         # Service worker
│   ├── content.ts            # Content script
│   └── sidepanel/            # React sidepanel UI
│       ├── App.tsx           # Main app
│       ├── components/       # Chat UI components
│       ├── lib/models.ts     # Model definitions
│       └── pages/            # Page components
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── ai-elements/          # AI chat UI elements
├── hooks/                    # React hooks
│   ├── use-chat-persistence.ts
│   ├── use-conversations.ts
│   ├── use-agents.ts         # Agent CRUD
│   ├── use-api-key.ts
│   └── use-theme.ts
├── db/                       # IndexedDB layer
│   ├── schema.ts             # Types (Agent, Conversation, Message)
│   ├── operations.ts         # CRUD functions
│   └── index.ts              # Unified exports
├── lib/
│   └── utils.ts              # Utilities (cn)
├── backend/                  # Express backend
│   └── src/
│       ├── index.ts          # Server entry
│       ├── routes/chat.ts    # Chat API
│       ├── mcp/client.ts     # MCP client
│       └── utils/hitl.ts     # HITL utilities
├── .memory/                  # AI context docs
├── wxt.config.ts             # WXT config
└── app.config.ts             # Runtime config
```

## Conventions

- `@/` alias → project root
- `#imports` → WXT auto-imports
- Entry points auto-discovered by WXT

## Related

See [[project-overview]], [[backend]]
