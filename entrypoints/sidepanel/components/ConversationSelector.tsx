import { Check, ChevronsUpDown, MessageSquare } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/lib/db'

interface ConversationSelectorProps {
  conversations: Conversation[]
  currentConversationId: string | null
  onSelect: (id: string) => void
  loading?: boolean
}

export function ConversationSelector({
  conversations,
  currentConversationId,
  onSelect,
  loading,
}: ConversationSelectorProps) {
  const [open, setOpen] = useState(false)

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  )

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="justify-between gap-2 px-2 h-8 max-w-[180px]"
          disabled={loading}
        >
          <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm font-medium">
            {currentConversation?.title || 'Select chat...'}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" align="center">
        <Command>
          <CommandInput placeholder="Search chats..." className="h-9" />
          <CommandList>
            <CommandEmpty>No chats found.</CommandEmpty>
            <CommandGroup>
              {conversations.map((conversation) => (
                <CommandItem
                  key={conversation.id}
                  value={conversation.title}
                  onSelect={() => {
                    onSelect(conversation.id)
                    setOpen(false)
                  }}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm">{conversation.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(conversation.updatedAt)}
                    </p>
                  </div>
                  <Check
                    className={cn(
                      'h-4 w-4 shrink-0',
                      currentConversationId === conversation.id
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

