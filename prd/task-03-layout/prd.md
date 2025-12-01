## Task 03: Re-design Layout & Route

### Requirements

#### Layout

- Remove the tab component
- Header structure:
  - Left: Logo
  - Middle: Conversation title (fixed text)
  - Right: New chat button + Menu dropdown (Settings & Debug)

#### Pages

- **Chat Page**: Default homepage
- **Settings Page**: Accessible from menu dropdown, includes back button
- **Debug Page**: Accessible from menu dropdown

#### Navigation

- Use simple React state for routing (no external router library)
- New chat button: function left empty (placeholder)
- Settings page: provide back button to return to chat

#### Folder Structure

```
entrypoints/sidepanel/
  main.tsx              # entry point
  App.tsx               # root component with routing
  pages/                # route components
    ChatPage.tsx
    SettingsPage.tsx
    DebugPage.tsx
  components/           # shared components
    Header.tsx
    ChatView.tsx
    DebugView.tsx
    SettingsView.tsx
```
