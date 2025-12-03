---
title: Chat View Components
tags: [ui, components, chat]
date: 2025-12-03
---

# Chat View Components

## Overview

The chat interface is built with modular components extracted from `ChatView.tsx`.

## Component Structure

```
entrypoints/sidepanel/
├── components/
│   ├── ChatView.tsx         # Main chat container (~280 lines)
│   ├── MessageParts.tsx     # Message part rendering
│   └── ToolConfirmation.tsx # Tool approval UI
└── lib/
    └── models.ts            # Model configuration
```

## Hooks

### useFileUpload

Located at `hooks/use-file-upload.ts`:

```typescript
const {
  files,
  fileInputRef,
  openFileDialog,
  handleFileChange,
  removeFile,
  clearFiles,
  getFileParts,
  hasFiles,
  fileCount,
} = useFileUpload()
```

## Message Parts

Based on stream message types from [[ai-sdk-integration]]:

| Part Type | Component | Description |
|-----------|-----------|-------------|
| `source-url` | `SourcesPart` | Web search results |
| `reasoning` | `ReasoningPart` | Chain of thought |
| `tool-ui` | `ToolPart` | Tool invocation status |
| `file` | `FilePartDisplay` | Image/file attachments |
| `text` | `TextPart` | Message text content |

## Tool States

Tool invocations follow human-in-the-loop pattern:

- `input-available` → Show confirmation UI
- `output-available` → Show result (success/error)
- Other states → Show loading spinner

## Related

- [[ai-sdk-integration]]
- [[component-patterns]]
- [[mcp-integration]]

