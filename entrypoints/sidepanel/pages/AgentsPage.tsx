import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import type { Agent } from '@/db'
import { useAgents } from '@/hooks/use-agents'
import { ArrowLeft, MessageSquarePlus, Pencil, Plus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface AgentsPageProps {
  onBack: () => void
  onEditAgent: (agentId: string | null) => void
  onNewChat: (agentId: string) => void
}

export function AgentsPage({ onBack, onEditAgent, onNewChat }: AgentsPageProps) {
  const { agents, loading, error } = useAgents()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Chat
        </Button>
        <Button size="sm" onClick={() => onEditAgent(null)}>
          <Plus className="mr-2 h-4 w-4" />
          New Agent
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Agents</h2>
            <p className="text-sm text-muted-foreground">
              Manage your AI agents with custom prompts and tools
            </p>
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <Spinner className="h-8 w-8" />
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-destructive">
              Failed to load agents: {error.message}
            </div>
          )}

          {!loading && !error && agents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No agents found. Create your first agent!
            </div>
          )}

          {!loading && !error && agents.length > 0 && (
            <div className="space-y-2">
              {agents.map((agent) => (
                <AgentListItem
                  key={agent.id}
                  agent={agent}
                  onEdit={() => onEditAgent(agent.id)}
                  onNewChat={() => onNewChat(agent.id)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

interface AgentListItemProps {
  agent: Agent
  onEdit: () => void
  onNewChat: () => void
}

function AgentListItem({ agent, onEdit, onNewChat }: AgentListItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <Avatar className="h-10 w-10">
        <AvatarImage src={agent.icon} alt={agent.name} />
        <AvatarFallback>{agent.name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{agent.name}</h3>
        <p className="text-xs text-muted-foreground truncate">
          {agent.systemPrompt.slice(0, 60)}
          {agent.systemPrompt.length > 60 ? '...' : ''}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onEdit} title="Edit agent">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChat}
          title="Start new chat"
        >
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

