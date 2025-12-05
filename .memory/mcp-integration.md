---
title: MCP Integration
tags: [mcp, tools, hitl]
date: 2025-12-05
---

# MCP Integration

Model Context Protocol tools with human-in-the-loop confirmation.

## Configuration

Cursor/Claude Desktop compatible JSON:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"]
    },
    "remote": {
      "url": "https://example.com/mcp",
      "type": "http"
    }
  }
}
```

## Transport Types

- **stdio** - Local servers (command + args)
- **http** - HTTP endpoints
- **sse** - Server-Sent Events

## Human-in-the-Loop Flow

1. AI requests tool call
2. Frontend shows approval UI
3. User approves or denies
4. Backend executes if approved
5. Result returned to AI

## Frontend Hook

```typescript
const { config, setConfigFromJSON, hasServers } = useMCPConfig()
```

## Tool UI States

| State | Behavior |
|-------|----------|
| `input-streaming` | Pending |
| `input-available` | Show approve/deny buttons |
| `output-available` | Show result |
| `output-error` | Show error |

## Approval Constants

```typescript
const APPROVAL = {
  YES: 'Yes, confirmed.',
  NO: 'No, denied.',
}
```

## Related

See [[backend]], [[ai-sdk-integration]]
