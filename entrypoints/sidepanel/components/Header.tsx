import { Sparkles, Plus, MoreVertical, Settings, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConversationSelector } from './ConversationSelector'
import type { Conversation } from '@/lib/db'

interface HeaderProps {
  onNavigate: (page: 'chat' | 'settings' | 'debug') => void
  conversations: Conversation[]
  currentConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewChat: () => void
  conversationsLoading?: boolean
}

export function Header({
  onNavigate,
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  conversationsLoading,
}: HeaderProps) {
  return (
    <div className="border-b px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">AgentX</h1>
          </div>
        </div>

        {/* Middle: Conversation Selector */}
        <div className="flex-1 flex justify-center">
          <ConversationSelector
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelect={onSelectConversation}
            loading={conversationsLoading}
          />
        </div>

        {/* Right: New Chat + Menu */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onNewChat}>
            <Plus className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onNavigate('settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate('debug')}>
                <Bug className="mr-2 h-4 w-4" />
                Debug
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
