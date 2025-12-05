---
title: Backend Server
tags: [backend, express, ai-sdk]
date: 2025-12-05
---

# Backend Server

Express backend providing AI chat API with MCP tool support.

## Location

`backend/` folder

## Scripts

```bash
pnpm backend:install  # Install dependencies
pnpm backend:dev      # Development (tsx watch)
pnpm backend:build    # Build TypeScript
pnpm backend:start    # Production
```

## API

### POST /api/chat

Streaming chat endpoint.

**Request**:

```typescript
{
  messages: UIMessage[]
  mcpConfig?: { mcpServers: Record<string, MCPServerConfig> }
  apiKeys?: { aiGateway?, google?, openai?, anthropic? }
  model?: string  // e.g., "google/gemini-2.5-flash"
}
```

**Response**: Streaming UIMessageStream

### GET /health

Health check.

## Model Support

- `google/*` - Google AI (gemini-2.5-flash, etc.)
- `openai/*` - Via AI Gateway
- `anthropic/*` - Via AI Gateway

Default: `google/gemini-2.5-flash-lite`

## MCP Integration

- Creates MCP clients from config
- Supports stdio, HTTP, SSE transports
- Tool names prefixed: `serverName__toolName`
- Human-in-the-loop for all tool executions

## Environment

```
GOOGLE_GENERATIVE_AI_API_KEY=
AI_GATEWAY_API_KEY=
PORT=3001
```

## Related

See [[mcp-integration]], [[ai-sdk-integration]]
