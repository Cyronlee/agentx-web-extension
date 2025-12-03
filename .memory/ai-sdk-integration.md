---
title: AI SDK Integration
tags: [ai, chat, persistence, indexeddb]
date: 2025-12-03
---

# AI SDK Integration

The extension integrates with AI SDK for real-time chat functionality with message persistence and MCP tool support.

## Dependencies

- `@ai-sdk/react` - React hooks for AI chat
- `ai` - AI SDK core (DefaultChatTransport, UIMessage types)
- `idb` - Promise-based IndexedDB wrapper

## Architecture

### API Configuration

- **Backend API**: `http://localhost:3001/api/chat`
- **Multi-provider API Keys** stored in `browser.storage.local` via [[storage-pattern]]
- **MCP Config** stored in `browser.storage.local`

### Provider API Keys (`hooks/use-api-key.ts`)

```typescript
interface ProviderApiKeys {
  aiGateway: string   // Vercel AI Gateway
  google: string      // Google AI
  openai: string      // OpenAI (direct)
  anthropic: string   // Anthropic (direct)
}
```

### Database Layer (`lib/db.ts`)

Uses `idb` library for IndexedDB operations:

**Database**: `agentx-chat-db` (version 1)

**Tables**:

1. `conversations` - Chat conversations
   - `id`: string (nanoid)
   - `title`: string
   - `createdAt`: number
   - `updatedAt`: number
   - Index: `by-updatedAt`

2. `messages` - Chat messages
   - `id`: string (from UIMessage)
   - `conversationId`: string (foreign key)
   - `role`: 'user' | 'assistant' | 'system'
   - `parts`: UIMessage['parts']
   - `metadata`: unknown (optional)
   - `createdAt`: number
   - Index: `by-conversationId`

### Chat Persistence Hook (`hooks/use-chat-persistence.ts`)

Wraps `useChat` from `@ai-sdk/react` with persistence and MCP support:

```typescript
const {
  messages,
  sendMessage,
  addToolOutput,    // For HITL tool confirmation
  status,
  stop,
  conversation,
  isLoading,
  error,
  newConversation,
} = useChatPersistence({ conversationId, onConversationUpdate })
```

**Features**:
- Auto-loads last conversation on mount
- Creates new conversation if none exists
- Saves messages to IndexedDB on each exchange
- Auto-generates conversation title from first message
- Passes MCP config and API keys via custom body
- Supports tool output for human-in-the-loop
- Callback `onConversationUpdate` for refreshing conversation list

### Conversations Hook (`hooks/use-conversations.ts`)

Manages the conversation list for selection UI:

```typescript
const {
  conversations,           // All conversations sorted by updatedAt
  currentConversation,     // Currently selected conversation
  currentConversationId,   // ID of current conversation
  loading,                 // Loading state
  createNewConversation,   // Create and select new conversation
  removeConversation,      // Delete a conversation
  selectConversation,      // Select a conversation by ID
  refreshConversations,    // Refresh the conversation list
} = useConversations()
```

**Features**:
- Auto-loads all conversations on mount
- Auto-selects most recent conversation
- Creates new conversation if none exist
- Handles deletion with auto-selection of next conversation

### DefaultChatTransport Configuration

```typescript
const transport = new DefaultChatTransport({
  api: 'http://localhost:3001/api/chat',
  body: async () => {
    const [apiKeys, mcpConfig] = await Promise.all([
      getApiKeys(),
      getMCPConfig(),
    ])
    return { apiKeys, mcpConfig }
  },
})
```

## Message Parts Support

The integration supports AI SDK message parts:
- `text` - Text content
- `reasoning` - Reasoning/thinking content
- `source-url` - Web source citations
- `tool-*` - Tool invocation states for HITL

## Tool Confirmation UI

ChatView renders tool parts with approval buttons:

```typescript
// Tool waiting for confirmation
if (isToolUIPart(part) && part.state === 'input-available') {
  return <ToolApprovalUI part={part} />
}

// Tool executed
if (isToolUIPart(part) && part.state === 'output-available') {
  return <ToolResultUI part={part} />
}
```

## Usage Example

```typescript
import { useChatPersistence } from '@/hooks/use-chat-persistence'

function ChatView() {
  const { messages, sendMessage, addToolOutput, status } = useChatPersistence()
  
  const handleSend = () => {
    sendMessage({ text: 'Hello!' })
  }
  
  const handleToolApproval = async (toolCallId, toolName, approved) => {
    await addToolOutput({
      toolCallId,
      tool: toolName,
      output: approved ? 'Yes, confirmed.' : 'No, denied.',
    })
    sendMessage() // Continue conversation
  }
  
  return (
    <div>
      {messages.map(msg => (
        <Message key={msg.id} from={msg.role}>
          {/* Render text and tool parts */}
        </Message>
      ))}
    </div>
  )
}
```

## Related

- [[backend]] - Backend server with chat API
- [[mcp-integration]] - MCP tools and HITL flow
- [[storage-pattern]] - Storage API patterns
- [[component-patterns]] - UI component patterns
