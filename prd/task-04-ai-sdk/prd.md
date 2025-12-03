# Task 04: AI SDK Integration

Integrate AI SDK UI with real backend

## Dependencies

- `@ai-sdk/react` - React hooks for AI SDK
- `idb` - Promise-based IndexedDB wrapper (lightweight, type-safe)

## Requirements

### API Configuration

- Add API Key configuration field in Settings page
- Store API Key in `browser.storage.local` using WXT storage API
- API URL: `https://express-ai-sdk-demo.vercel.app`
- Use `Hook-Level Configuration` (DefaultChatTransport) to carry the API key via headers

### Data Persistence (IndexedDB with `idb`)

- **Database name**: `agentx-chat-db`
- **Version**: 1

- **Conversation table** (`conversations`):

  ```typescript
  {
    id: string,           // nanoid
    title: string,        // Auto-generated from first message or "New Chat"
    createdAt: number,    // timestamp
    updatedAt: number     // timestamp
  }
  ```

- **Message table** (`messages`):
  ```typescript
  {
    id: string,                              // from UIMessage.id
    conversationId: string,                  // foreign key
    role: 'user' | 'assistant' | 'system',
    parts: UIMessagePart[],                  // from AI SDK
    metadata?: unknown,                      // optional metadata
    createdAt: number                        // timestamp
  }
  ```

### Database Library (`lib/db.ts`)

- Use `idb` library for type-safe IndexedDB operations
- Implement conversation CRUD:
  - `createConversation()`
  - `getConversation(id)`
  - `getAllConversations()`
  - `updateConversation(id, updates)`
  - `deleteConversation(id)`
- Implement message CRUD:
  - `addMessage(message)`
  - `getMessagesByConversationId(conversationId)`
  - `deleteMessagesByConversationId(conversationId)`

### Chat Hook (`hooks/use-chat-persistence.ts`)

- Wrap `useChat` from `@ai-sdk/react`
- Handle conversation lifecycle:
  - On mount: Load last conversation or create new empty one
  - On first message: Auto-generate conversation title
  - On each message: Auto-save to IndexedDB
- Expose conversation management methods

### UI Integration

- Keep current chat UI components (MessageBranch, Reasoning, Sources, etc.)
- Backend supports `toUIMessageStreamResponse` with:
  - `sendReasoning: true`
  - `sendSources: true`
- Remove mock data from `ChatView.tsx`
- Connect to real `useChat` hook with persistence

### Settings Page Updates

- Add "AI Configuration" section with:
  - API Key input field (password type with show/hide toggle)
  - Connection test button (optional)
- Store API Key securely in browser.storage.local

### Startup Behavior

- On extension open: Automatically restore last conversation
- If no conversations exist: Create an empty conversation
- Display conversation messages from IndexedDB
