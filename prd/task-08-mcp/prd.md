## chat page

- add a button in the input area under <PromptInputTools> to display active mcpServers

## mcp servers indicator

- automatically invoke backend api to show active mcpServers in the input area
- show mcp servers status and tools count in outside
- click to show all tools detail in a modal component, show a enable disable button in the top (will update agent mcpServersEnabled field), collapse every server by default

## backend

- receive agent systemPrompt, mcpServers from frontend
- add a new api to init mcpServers

## iconify

add iconify to the project, and update memory and global rules

```bash
npm install @iconify/react @iconify-json/lucide
```

### initialize

```tsx
import { addCollection } from '@iconify/react'
import { icons as lucide } from '@iconify-json/lucide'

addCollection(lucide)
```

### usage

```tsx
import { Icon } from "@iconify/react"

<Icon icon="lucide:circle-user" />

<Icon icon="lucide:check" className="w-4 h-4 text-green-500" />
```
