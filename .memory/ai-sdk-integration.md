---
title: AI SDK Integration
tags: [ai, chat, persistence, indexeddb]
date: 2025-12-03
---

# AI SDK Integration

The extension integrates with AI SDK for real-time chat functionality with message persistence.

## Dependencies

- `@ai-sdk/react` - React hooks for AI chat
- `ai` - AI SDK core (DefaultChatTransport, UIMessage types)
- `idb` - Promise-based IndexedDB wrapper

## Architecture

### API Configuration

- API URL: `https://express-ai-sdk-demo.vercel.app`
- API Key stored in `browser.storage.local` via [[storage-pattern]]
- Hook: `hooks/use-api-key.ts`

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

Wraps `useChat` from `@ai-sdk/react` with persistence:

```typescript
const {
  messages,
  sendMessage,
  status,
  stop,
  conversation,
  isLoading,
  error,
  newConversation,
} = useChatPersistence()
```

**Features**:
- Auto-loads last conversation on mount
- Creates new conversation if none exists
- Saves messages to IndexedDB on each exchange
- Auto-generates conversation title from first message
- Uses `DefaultChatTransport` with dynamic API key headers

### Settings Integration

`SettingsView.tsx` includes AI Configuration section:
- API Key input with show/hide toggle
- Stored securely in browser.storage.local

## Message Parts Support

The integration supports AI SDK message parts:
- `text` - Text content
- `reasoning` - Reasoning/thinking content
- `source-url` - Web source citations

## Usage Example

```typescript
import { useChatPersistence } from '@/hooks/use-chat-persistence'

function ChatView() {
  const { messages, sendMessage, status } = useChatPersistence()
  
  const handleSend = () => {
    sendMessage({ text: 'Hello!' })
  }
  
  return (
    <div>
      {messages.map(msg => (
        <Message key={msg.id} from={msg.role}>
          {msg.parts.filter(p => p.type === 'text').map(p => p.text)}
        </Message>
      ))}
    </div>
  )
}
```

## Related

- [[storage-pattern]] - Storage API patterns
- [[component-patterns]] - UI component patterns

