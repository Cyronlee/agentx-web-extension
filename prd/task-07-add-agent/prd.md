Add Agent feature to the extension

## db model

```typescript
{
  id: string,
  name: string,
  icon: string,
  systemPrompt: string,
  mcpServersEnabled: boolean,
  mcpServers: string,
  createdAt: number,
  updatedAt: number,
}
```

- modify table conversation to add agentId

## ui

### Agents page

- render agents in vertical list, load from db
- render a new button to create a new agent
- render icon, name, edit button, new chat button for each list item

### new/edit agent page

- support all fields in db model
- add delete button when edit a agent
- could save, update, delete agent into db

### Chat page

- create a new conversation now must select an agent, the conversation title will be the agent icon + name + current time
- pass agent systemPrompt, mcpServers to backend
- add a button in the input area to display active mcpServers

### mcp servers indicator

- automatically show active mcpServers in the input area
- show tools count in outside
- click to show all tools detail in a modal component

## backend

- receive agent systemPrompt, mcpServers from frontend
- add a new api to init mcpServers
