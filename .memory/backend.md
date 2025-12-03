---
title: Backend Server
tags: [backend, express, ai-sdk, mcp]
date: 2025-12-03
---

# Backend Server

Express backend server providing AI chat API with MCP tool support and human-in-the-loop functionality.

## Location

`backend/` folder in project root

## Technology Stack

- **Express 5.x** - HTTP server
- **AI SDK** - `ai`, `@ai-sdk/google`, `@ai-sdk/mcp`
- **TypeScript** - Full type safety
- **tsx** - Development runtime

## Scripts

From project root:

```bash
pnpm backend:install  # Install backend dependencies
pnpm backend:dev      # Development with hot reload
pnpm backend:build    # Build for production
pnpm backend:start    # Start production server
```

## API Endpoints

### POST /api/chat

Main chat endpoint with streaming response.

**Request Body**:

```typescript
{
  messages: UIMessage[]
  mcpConfig?: {
    mcpServers: Record<string, MCPServerConfig>
  }
  apiKeys?: {
    aiGateway?: string
    google?: string
    openai?: string
    anthropic?: string
  }
  model?: string  // e.g., "openai/gpt-4o", "google/gemini-2.5-flash"
}
```

**Response**: Streaming UIMessageStream

### GET /health

Health check endpoint.

## Architecture

### File Structure

```
backend/
├── src/
│   ├── index.ts           # Server entry point
│   ├── types.ts           # Type definitions
│   ├── routes/
│   │   └── chat.ts        # Chat API route
│   ├── mcp/
│   │   └── client.ts      # MCP client management
│   └── utils/
│       └── hitl.ts        # Human-in-the-loop utilities
├── package.json
├── tsconfig.json
└── .env.example
```

### MCP Client Management

- Creates MCP clients from configuration
- Supports stdio, HTTP, and SSE transports
- Prefixes tool names with server name: `serverName__toolName`
- Closes connections after streaming completes

### Human-in-the-loop (HITL)

All MCP tools require user confirmation before execution:

1. Tool calls are forwarded to frontend without execution
2. Frontend shows approval UI
3. User approves or denies
4. Backend executes approved tools and updates results

**Approval States**:

```typescript
const APPROVAL = {
  YES: 'Yes, confirmed.',
  NO: 'No, denied.',
}
```

## Environment Variables

```
AI_GATEWAY_API_KEY=      # Vercel AI Gateway
GOOGLE_GENERATIVE_AI_API_KEY=  # Google AI
PORT=3001                # Server port
```

## Model Support

- **Vercel AI Gateway**: Default, uses `openai/gpt-4o` format
- **Google AI**: Use `google/` prefix, e.g., `google/gemini-2.5-flash`

## Related

- [[mcp-integration]] - MCP configuration and tools
- [[ai-sdk-integration]] - Frontend AI SDK usage
