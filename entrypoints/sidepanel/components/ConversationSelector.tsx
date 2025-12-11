import { Check, ChevronsUpDown, MessageSquare, Trash2 } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { Conversation, Agent } from '@/db'
import { deleteConversation, getAgent } from '@/db'

interface ConversationSelectorProps {
  conversations: Conversation[]
  currentConversationId: string | null
  onSelect: (id: string) => void
  onConversationDeleted?: () => void
  loading?: boolean
}

// Agent Icon Component
function AgentIcon({ agent }: { agent: Agent | undefined }) {
  if (!agent?.icon) {
    return (
      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <MessageSquare className="h-3 w-3 text-primary" />
      </div>
    )
  }
  return (
    <img
      src={agent.icon}
      alt={agent.name}
      className="h-6 w-6 rounded-full shrink-0"
    />
  )
}

export function ConversationSelector({
  conversations,
  currentConversationId,
  onSelect,
  onConversationDeleted,
  loading,
}: ConversationSelectorProps) {
  const [open, setOpen] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [agentMap, setAgentMap] = useState<Map<string, Agent>>(new Map())

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  )

  const currentAgent = useMemo(
    () => currentConversation && agentMap.get(currentConversation.agentId),
    [currentConversation, agentMap]
  )

  // Load agents for conversations
  useEffect(() => {
    const loadAgents = async () => {
      const agentIds = [...new Set(conversations.map((c) => c.agentId))]
      const agents = await Promise.all(
        agentIds.map(async (id) => {
          const agent = await getAgent(id)
          return agent ? ([id, agent] as const) : null
        })
      )
      setAgentMap(
        new Map(agents.filter((a): a is [string, Agent] => a !== null))
      )
    }
    if (conversations.length > 0) {
      loadAgents()
    }
  }, [conversations])

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = date.toDateString() === yesterday.toDateString()

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    if (isYesterday) {
      return 'Yesterday'
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const handleDelete = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation()
    try {
      await deleteConversation(conversationId)
      onConversationDeleted?.()
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }

  // Add keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        className="justify-between gap-2 px-2 h-8 max-w-[200px]"
        disabled={loading}
      >
        <AgentIcon agent={currentAgent} />
        <span className="truncate text-sm font-medium">
          {currentConversation?.title || 'Select conversation...'}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="p-0 gap-0 max-w-[90vw]"
          showCloseButton={false}
        >
          <Command className="rounded-lg border-0">
            <CommandInput
              placeholder="Search conversations..."
              className="h-9"
            />
            <CommandList className="max-h-[400px]">
              <CommandEmpty>No conversations found.</CommandEmpty>
              <CommandGroup>
                {conversations.map((conversation) => {
                  const agent = agentMap.get(conversation.agentId)
                  const isHovered = hoveredId === conversation.id
                  const isCurrent = currentConversationId === conversation.id

                  return (
                    <CommandItem
                      key={conversation.id}
                      value={conversation.title}
                      onSelect={() => {
                        onSelect(conversation.id)
                        setOpen(false)
                      }}
                      onMouseEnter={() => setHoveredId(conversation.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className="flex items-center gap-2 py-2 cursor-pointer"
                    >
                      <AgentIcon agent={agent} />

                      <div className="flex-1 min-w-0 flex items-baseline gap-2">
                        <span className="truncate text-sm font-medium">
                          {conversation.title}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatDate(conversation.updatedAt)}
                        </span>
                      </div>

                      {isHovered ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={(e) => handleDelete(e, conversation.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      ) : (
                        <Check
                          className={cn(
                            'h-4 w-4 shrink-0',
                            isCurrent ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
