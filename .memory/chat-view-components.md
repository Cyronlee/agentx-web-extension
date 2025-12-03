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
│   ├── ChatView.tsx         # Main chat container
│   ├── MessageParts.tsx     # Message part rendering
│   └── ToolConfirmation.tsx # APPROVAL constants only
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

## File Upload UI

File attachments use a compact dropdown menu with:

- Upload file / photo / PDF options
- Badge counter on attachment button when files selected
- File names shown in dropdown when attached
- Clear attachments option

## Message Parts

Based on stream message types from [[ai-sdk-integration]]:

| Part Type | Component | Description |
|-----------|-----------|-------------|
| `source-url` | `SourcesPart` | Web search results |
| `reasoning` | `ReasoningPart` | Chain of thought |
| `tool-ui` | `ToolPart` | Tool invocation with standard Tool component |
| `file` | `FilePartDisplay` | Image/file attachments |
| `text` | `TextPart` | Message text content |

## Tool UI

Tool invocations use the standard `@/components/ai-elements/tool` components:

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
    {/* HITL confirmation buttons for input-available state */}
    <ToolOutput output={part.output} errorText={part.errorText} />
  </ToolContent>
</Tool>
```

### Tool States

| State | UI Behavior |
|-------|-------------|
| `input-streaming` | Pending badge, collapsed |
| `input-available` | Running badge, open with approve/deny buttons |
| `output-available` | Completed badge, open with output |
| `output-error` | Error badge, open with error message |

### HITL (Human-in-the-Loop)

Confirmation buttons appear inside `ToolContent` when `state === 'input-available'`:

```typescript
// ToolConfirmation.tsx exports only constants
export const APPROVAL = {
  YES: 'Yes, confirmed.',
  NO: 'No, denied.',
} as const
```

## Related

- [[ai-sdk-integration]]
- [[component-patterns]]
- [[mcp-integration]]
