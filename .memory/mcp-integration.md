---
title: MCP Integration
tags: [mcp, tools, human-in-the-loop]
date: 2025-12-03
---

# MCP Integration

Model Context Protocol (MCP) integration for tool access with human-in-the-loop confirmation.

## Overview

MCP servers provide tools that the AI can use. All tool executions require explicit user approval before running.

## Configuration Format

Cursor/Claude Desktop compatible JSON format:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"],
      "env": {}
    },
    "remote-server": {
      "url": "https://example.com/mcp",
      "type": "http"
    }
  }
}
```

### Transport Types

1. **stdio** (local servers)
   ```json
   {
     "command": "npx",
     "args": ["-y", "@modelcontextprotocol/server-xxx"]
   }
   ```

2. **HTTP** (production recommended)
   ```json
   {
     "url": "https://server.com/mcp",
     "type": "http"
   }
   ```

3. **SSE** (Server-Sent Events)
   ```json
   {
     "url": "https://server.com/sse",
     "type": "sse"
   }
   ```

## Frontend Hook

`hooks/use-mcp-config.ts`:

```typescript
const {
  config,           // Current MCP config
  setConfigFromJSON, // Save config from JSON string
  getConfigAsJSON,   // Get config as JSON string
  hasServers,        // Boolean: has any servers
  serverNames,       // Array of server names
  error,             // Validation error
} = useMCPConfig()
```

## Settings UI

Located in `SettingsView.tsx`:
- JSON textarea for MCP configuration
- Real-time validation with visual feedback
- Connected servers badges

## Human-in-the-loop Flow

1. **AI requests tool**: Model generates tool call
2. **Frontend shows UI**: Approval dialog with tool name and parameters
3. **User decides**: Click "Approve" or "Deny"
4. **Backend executes**: Only if approved
5. **Result returned**: Tool output or denial message

### Frontend Tool UI

Uses standard `@/components/ai-elements/tool` components:

```typescript
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool'

<Tool defaultOpen={shouldOpenByDefault}>
  <ToolHeader type={part.type} state={part.state} />
  <ToolContent>
    <ToolInput input={part.input} />
    {/* Approval buttons shown when state === 'input-available' */}
    <ToolOutput output={part.output} errorText={part.errorText} />
  </ToolContent>
</Tool>
```

See [[chat-view-components]] for full implementation.

### Approval Constants (shared)

```typescript
const APPROVAL = {
  YES: 'Yes, confirmed.',
  NO: 'No, denied.',
}
```

## Tool Name Format

Tools from MCP servers are prefixed: `serverName__toolName`

Example: `filesystem__read_file`

## Data Flow

```
Frontend                    Backend
   │                           │
   │──── messages + config ───►│
   │                           │── Create MCP clients
   │                           │── Stream with tools (no execute)
   │◄──── tool-call ──────────│
   │                           │
   │ [User approves/denies]    │
   │                           │
   │──── approval ────────────►│
   │                           │── Execute if approved
   │◄──── tool-output ────────│
   │                           │
   │◄──── text response ──────│
```

## Related

- [[backend]] - Backend server architecture
- [[ai-sdk-integration]] - AI SDK usage patterns
- [[storage-pattern]] - MCP config persistence

