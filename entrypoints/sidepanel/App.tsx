import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { Header } from './components/Header'
import { ChatPage } from './pages/ChatPage'
import { SettingsPage } from './pages/SettingsPage'
import { DebugPage } from './pages/DebugPage'

type Page = 'chat' | 'settings' | 'debug'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('chat')

  const handleNavigate = (page: Page) => {
    setCurrentPage(page)
  }

  const handleBackToChat = () => {
    setCurrentPage('chat')
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Toaster position="top-center" expand={true} richColors />

      <Header onNavigate={handleNavigate} />

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {currentPage === 'chat' && <ChatPage />}
        {currentPage === 'settings' && (
          <SettingsPage onBack={handleBackToChat} />
        )}
        {currentPage === 'debug' && <DebugPage onBack={handleBackToChat} />}
      </div>
    </div>
  )
}

export default App
