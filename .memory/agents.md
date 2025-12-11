---
title: Agents Feature
tags: [agents, mcp, system-prompt]
date: 2025-12-08
---

# Agents Feature

Agents are customizable AI assistants with their own system prompts and MCP server configurations.

## Data Model

```typescript
interface Agent {
  id: string
  name: string
  icon: string              // URL to icon image
  systemPrompt: string
  mcpServersEnabled: boolean
  mcpServers: string        // JSON string of MCP config
  createdAt: number
  updatedAt: number
}
```

## Database

- Schema: `db/schema.ts` - Agent type, updated DB_VERSION to 2
- Operations: `db/operations.ts` - CRUD for agents
- Default agent created on first load

## Hooks

- `hooks/use-agents.ts` - Agent CRUD operations
- `hooks/use-conversations.ts` - Updated to create conversations with agentId
- `hooks/use-chat-persistence.ts` - Passes agent systemPrompt and MCP config to backend

## UI Components

### Pages
- `AgentsPage.tsx` - List all agents with edit/new chat buttons
- `AgentEditPage.tsx` - Create/edit agent form with all fields

### Components
- `MCPServersIndicator.tsx` - Shows active MCP servers in chat input

## Backend Integration

- `ChatRequestBody.systemPrompt` - System prompt from agent
- `chat.ts` uses `system` parameter in `streamText()` call

## Navigation

App.tsx routes:
- `agents` - AgentsPage
- `agent-edit` - AgentEditPage (with editingAgentId state)

Header menu includes "Agents" option.

## MCP Configuration

MCP servers are stored as JSON string per agent:

```json
{
  "mcpServers": {
    "server-name": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

Enabled via `mcpServersEnabled` toggle.

## Related

See [[mcp-integration]], [[backend]], [[ai-sdk-integration]]

