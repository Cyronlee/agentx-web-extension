---
title: AI SDK Integration
tags: [ai, chat, persistence]
date: 2025-12-05
---

# AI SDK Integration

Chat functionality with message persistence and streaming.

## Hooks

### useChatPersistence

Main chat hook wrapping `@ai-sdk/react` useChat:

```typescript
const {
  messages,
  sendMessage,
  addToolOutput,  // For HITL approval
  status,
  stop,
  conversation,
  isLoading,
  newConversation,
} = useChatPersistence({ conversationId, onConversationUpdate })
```

### useConversations

Conversation list management:

```typescript
const {
  conversations,
  currentConversationId,
  createNewConversation,
  selectConversation,
  refreshConversations,
} = useConversations()
```

## Database (IndexedDB)

**Database**: `agentx-chat-db`

**Tables**:

- `conversations` - id, title, createdAt, updatedAt
- `messages` - id, conversationId, role, parts, metadata, createdAt

## Message Parts

Supported AI SDK message parts:

- `text` - Text content
- `reasoning` - Chain of thought (Gemini 2.5+)
- `source-url` - Citations
- `tool-ui` - Tool invocations
- `file` - Attachments

## Transport

```typescript
const transport = new DefaultChatTransport({
  api: 'http://localhost:3001/api/chat',
  body: async () => ({ apiKeys, mcpConfig }),
})
```

## Related

See [[backend]], [[mcp-integration]]
