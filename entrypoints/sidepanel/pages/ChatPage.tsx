import { ChatView } from '../components/ChatWindow'

interface ChatPageProps {
  conversationId: string | null
  onConversationUpdate?: () => void
  onNavigate?: (page: 'magic-templates') => void
}

export function ChatPage({
  conversationId,
  onConversationUpdate,
  onNavigate,
}: ChatPageProps) {
  if (!conversationId) {
    return (
      <div className="flex size-full items-center justify-center bg-secondary">
        <p className="text-muted-foreground">Loading conversation...</p>
      </div>
    )
  }

  return (
    <ChatView
      key={conversationId}
      conversationId={conversationId}
      onConversationUpdate={onConversationUpdate}
      onNavigate={onNavigate}
    />
  )
}
