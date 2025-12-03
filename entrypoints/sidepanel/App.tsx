import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { useConversations } from '@/hooks/use-conversations'
import { Header } from './components/Header'
import { ChatPage } from './pages/ChatPage'
import { SettingsPage } from './pages/SettingsPage'
import { DebugPage } from './pages/DebugPage'
import { ChatView } from './components/ChatDemo'

type Page = 'chat' | 'settings' | 'debug' | 'demo'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('chat')

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

  const handleNewChat = async () => {
    await createNewConversation()
    setCurrentPage('chat')
  }

  const handleSelectConversation = (id: string) => {
    selectConversation(id)
    setCurrentPage('chat')
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Toaster position="top-center" expand={true} richColors />

      <Header
        onNavigate={handleNavigate}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        conversationsLoading={conversationsLoading}
      />

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {currentPage === 'chat' && (
          <ChatPage
            conversationId={currentConversationId}
            onConversationUpdate={refreshConversations}
          />
        )}
        {currentPage === 'settings' && (
          <SettingsPage onBack={handleBackToChat} />
        )}
        {currentPage === 'debug' && <DebugPage onBack={handleBackToChat} />}
        {currentPage === 'demo' && <ChatView />}
      </div>
    </div>
  )
}

export default App
