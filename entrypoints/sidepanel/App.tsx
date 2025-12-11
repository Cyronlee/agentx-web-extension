import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { useConversations } from '@/hooks/use-conversations'
import { Header } from './components/Header'
import { ChatPage } from './pages/ChatPage'
import { SettingsPage } from './pages/SettingsPage'
import { DebugPage } from './pages/DebugPage'
import { AgentsPage } from './pages/AgentsPage'
import { AgentEditPage } from './pages/AgentEditPage'
import { MagicTemplatesPage } from './pages/MagicTemplatesPage'
import { ChatView } from './components/ChatDemo'

type Page =
  | 'chat'
  | 'settings'
  | 'debug'
  | 'demo'
  | 'agents'
  | 'agent-edit'
  | 'magic-templates'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('chat')
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null)

  const {
    conversations,
    currentConversationId,
    loading: conversationsLoading,
    createNewConversation,
    selectConversation,
    refreshConversations,
  } = useConversations()

  const handleNavigate = (page: Page) => {
    setCurrentPage(page)
  }

  const handleBackToChat = () => {
    setCurrentPage('chat')
  }

  const handleNewChat = async (agentId?: string) => {
    await createNewConversation(agentId)
    setCurrentPage('chat')
  }

  const handleSelectConversation = (id: string) => {
    selectConversation(id)
    setCurrentPage('chat')
  }

  // Agent page handlers
  const handleEditAgent = (agentId: string | null) => {
    setEditingAgentId(agentId)
    setCurrentPage('agent-edit')
  }

  const handleAgentSaved = (_agentId: string) => {
    setCurrentPage('agents')
  }

  const handleAgentDeleted = () => {
    setCurrentPage('agents')
  }

  const handleBackToAgents = () => {
    setCurrentPage('agents')
  }

  const handleConversationDeleted = async () => {
    await refreshConversations()
    // If the deleted conversation was the current one, switch to the first available conversation
    // The refreshConversations will handle updating currentConversationId via the hook
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Toaster position="top-center" expand={true} richColors closeButton />

      <Header
        onNavigate={handleNavigate}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={() => handleNewChat()}
        onConversationDeleted={handleConversationDeleted}
        conversationsLoading={conversationsLoading}
      />

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {currentPage === 'chat' && (
          <ChatPage
            conversationId={currentConversationId}
            onConversationUpdate={refreshConversations}
            onNavigate={handleNavigate}
          />
        )}
        {currentPage === 'settings' && (
          <SettingsPage onBack={handleBackToChat} />
        )}
        {currentPage === 'debug' && <DebugPage onBack={handleBackToChat} />}
        {currentPage === 'demo' && <ChatView />}
        {currentPage === 'agents' && (
          <AgentsPage
            onBack={handleBackToChat}
            onEditAgent={handleEditAgent}
            onNewChat={(agentId) => handleNewChat(agentId)}
          />
        )}
        {currentPage === 'agent-edit' && (
          <AgentEditPage
            agentId={editingAgentId}
            onBack={handleBackToAgents}
            onSaved={handleAgentSaved}
            onDeleted={handleAgentDeleted}
          />
        )}
        {currentPage === 'magic-templates' && (
          <MagicTemplatesPage onBack={handleBackToChat} />
        )}
      </div>
    </div>
  )
}

export default App
