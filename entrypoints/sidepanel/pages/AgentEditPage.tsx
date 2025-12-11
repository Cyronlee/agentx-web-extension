import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { DEFAULT_AGENT, getAgent, type Agent } from '@/db'
import { useAgents } from '@/hooks/use-agents'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Server,
  Trash2,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface AgentEditPageProps {
  agentId: string | null // null = new agent
  onBack: () => void
  onSaved: (agentId: string) => void
  onDeleted: () => void
}

export function AgentEditPage({
  agentId,
  onBack,
  onSaved,
  onDeleted,
}: AgentEditPageProps) {
  const { addAgent, editAgent, removeAgent } = useAgents()
  const [loading, setLoading] = useState(!!agentId)
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState(DEFAULT_AGENT.name)
  const [icon, setIcon] = useState(
    DEFAULT_AGENT.icon + '?seed=' + Date.now().toString()
  )
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_AGENT.systemPrompt)
  const [mcpServersEnabled, setMcpServersEnabled] = useState(
    DEFAULT_AGENT.mcpServersEnabled
  )
  const [mcpServers, setMcpServers] = useState(DEFAULT_AGENT.mcpServers)
  const [mcpJsonValid, setMcpJsonValid] = useState<boolean | null>(null)

  const isEditMode = !!agentId

  // Load agent data if editing
  useEffect(() => {
    const loadAgent = async () => {
      if (!agentId) return

      try {
        setLoading(true)
        const agent = await getAgent(agentId)
        if (agent) {
          setName(agent.name)
          setIcon(agent.icon)
          setSystemPrompt(agent.systemPrompt)
          setMcpServersEnabled(agent.mcpServersEnabled)
          setMcpServers(agent.mcpServers)
        }
      } catch (err) {
        console.error('Failed to load agent:', err)
        toast.error('Failed to load agent')
      } finally {
        setLoading(false)
      }
    }

    loadAgent()
  }, [agentId])

  // Validate MCP JSON
  const handleMcpJsonChange = useCallback((value: string) => {
    setMcpServers(value)

    if (value.trim() === '') {
      setMcpJsonValid(null)
      return
    }

    try {
      const parsed = JSON.parse(value)
      if (typeof parsed.mcpServers === 'object' && parsed.mcpServers !== null) {
        setMcpJsonValid(true)
      } else {
        setMcpJsonValid(false)
      }
    } catch {
      setMcpJsonValid(null)
    }
  }, [])

  // Save agent
  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Agent name is required')
      return
    }

    if (mcpServersEnabled && mcpJsonValid === false) {
      toast.error('Invalid MCP configuration')
      return
    }

    try {
      setSaving(true)

      const agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'> = {
        name: name.trim(),
        icon: icon.trim() || DEFAULT_AGENT.icon,
        systemPrompt: systemPrompt.trim(),
        mcpServersEnabled,
        mcpServers: mcpServers.trim() || '{"mcpServers":{}}',
      }

      if (isEditMode && agentId) {
        await editAgent(agentId, agentData)
        toast.success('Agent updated')
        onSaved(agentId)
      } else {
        const newAgent = await addAgent(agentData)
        toast.success('Agent created')
        onSaved(newAgent.id)
      }
    } catch (err) {
      console.error('Failed to save agent:', err)
      toast.error('Failed to save agent')
    } finally {
      setSaving(false)
    }
  }

  // Delete agent
  const handleDelete = async () => {
    if (!agentId) return

    try {
      await removeAgent(agentId)
      toast.success('Agent deleted')
      onDeleted()
    } catch (err) {
      console.error('Failed to delete agent:', err)
      toast.error('Failed to delete agent')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h2 className="font-semibold">
          {isEditMode ? 'Edit Agent' : 'New Agent'}
        </h2>
        <div className="w-16" /> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={icon} alt={name} />
              <AvatarFallback>
                {name.slice(0, 2).toUpperCase() || 'AG'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Agent name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon URL</Label>
            <Input
              id="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="https://example.com/icon.png"
            />
            <p className="text-xs text-muted-foreground">
              Enter a URL to an image for the agent icon
            </p>
          </div>
        </div>

        <Separator />

        {/* System Prompt */}
        <div className="space-y-2">
          <Label htmlFor="systemPrompt">System Prompt</Label>
          <Textarea
            id="systemPrompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="You are a helpful AI assistant..."
            className="min-h-[150px] resize-y"
          />
          <p className="text-xs text-muted-foreground">
            Instructions that define how the agent behaves
          </p>
        </div>

        <Separator />

        {/* MCP Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              <div>
                <Label className="text-base">MCP Servers</Label>
                <p className="text-xs text-muted-foreground">
                  Enable Model Context Protocol tools
                </p>
              </div>
            </div>
            <Switch
              checked={mcpServersEnabled}
              onCheckedChange={setMcpServersEnabled}
            />
          </div>

          {mcpServersEnabled && (
            <div className="space-y-2">
              <Label htmlFor="mcpServers">Configuration (JSON)</Label>
              <div className="relative">
                <Textarea
                  id="mcpServers"
                  value={mcpServers}
                  onChange={(e) => handleMcpJsonChange(e.target.value)}
                  placeholder={`{
  "mcpServers": {
    "everything": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-everything"
      ]
    }
  }
}`}
                  className="font-mono text-xs min-h-[200px] resize-y"
                />
                {mcpJsonValid !== null && (
                  <div className="absolute right-2 top-2">
                    {mcpJsonValid ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Configure MCP servers for this agent. Supports HTTP and SSE
                transports.
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          {isEditMode && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex-1">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this agent? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Saving...
              </>
            ) : isEditMode ? (
              'Save Changes'
            ) : (
              'Create Agent'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
