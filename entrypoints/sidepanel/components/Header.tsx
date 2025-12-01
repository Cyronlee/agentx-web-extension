import { Sparkles, Plus, MoreVertical, Settings, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface HeaderProps {
  onNavigate: (page: 'chat' | 'settings' | 'debug') => void
}

export function Header({ onNavigate }: HeaderProps) {
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

        {/* Middle: Title */}
        <div className="flex-1 text-center">
          <h2 className="text-sm font-medium text-muted-foreground">AI Chat</h2>
        </div>

        {/* Right: New Chat + Menu */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // TODO: Implement new chat functionality
            }}
          >
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
