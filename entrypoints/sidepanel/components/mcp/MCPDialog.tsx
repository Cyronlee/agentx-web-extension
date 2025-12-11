import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { Agent } from '@/db'
import { parseAgentMCPConfig, updateAgent } from '@/db'
import { useMCPStatus } from '@/hooks/use-mcp-status'
import type { ParsedMCPConfig, MCPServerStatus } from '@/types/mcp'
import { Icon } from '@iconify/react'
import { useMemo, useEffect, useState, useCallback } from 'react'

interface MCPDialogProps {
  agent: Agent | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAgentUpdate?: () => void
}

export function MCPDialog({
  agent,
  open,
  onOpenChange,
  onAgentUpdate,
}: MCPDialogProps) {
  const [isTogglingEnabled, setIsTogglingEnabled] = useState(false)
  const [localEnabled, setLocalEnabled] = useState(
    agent?.mcpServersEnabled ?? false
  )
  const [openServers, setOpenServers] = useState<Set<string>>(new Set())

  // Sync local state when agent changes
  useEffect(() => {
    setLocalEnabled(agent?.mcpServersEnabled ?? false)
  }, [agent?.mcpServersEnabled])

  const mcpConfig = useMemo(() => {
    if (!agent) return null
    return parseAgentMCPConfig(agent) as ParsedMCPConfig | null
  }, [agent])

  const serverNames = useMemo(() => {
    if (!mcpConfig?.mcpServers) return []
    return Object.keys(mcpConfig.mcpServers)
  }, [mcpConfig])

  const hasServers = useMemo(() => {
    return serverNames.length > 0
  }, [serverNames])

  // Use SWR to manage MCP status
  const { serverStatus, isLoading, refresh } = useMCPStatus({
    mcpConfig,
    enabled: localEnabled && hasServers,
  })

  const handleToggleEnabled = useCallback(async () => {
    if (!agent) return

    const newEnabledState = !localEnabled
    setIsTogglingEnabled(true)

    try {
      // Update local state immediately for optimistic UI
      setLocalEnabled(newEnabledState)

      // Update database
      await updateAgent(agent.id, {
        mcpServersEnabled: newEnabledState,
      })

      // Notify parent to refresh agent data
      onAgentUpdate?.()

      // If turning on, refresh status (SWR will handle this automatically)
      if (newEnabledState && mcpConfig && hasServers) {
        refresh()
      }
    } catch (error) {
      console.error('Failed to toggle MCP servers:', error)
      // Revert local state on error
      setLocalEnabled(!newEnabledState)
    } finally {
      setIsTogglingEnabled(false)
    }
  }, [agent, localEnabled, mcpConfig, hasServers, refresh, onAgentUpdate])

  const toggleServer = useCallback((serverName: string) => {
    setOpenServers((prev) => {
      const next = new Set(prev)
      if (next.has(serverName)) {
        next.delete(serverName)
      } else {
        next.add(serverName)
      }
      return next
    })
  }, [])

  if (!agent) {
    return null
  }

  const renderServerList = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
          Loading server status...
        </div>
      )
    }

    if (serverStatus && mcpConfig) {
      return (
        <div className="space-y-3">
          {serverStatus.servers.map((server) => (
            <MCPServerItem
              key={server.name}
              server={server}
              config={mcpConfig}
              isOpen={openServers.has(server.name)}
              onToggle={() => toggleServer(server.name)}
            />
          ))}
        </div>
      )
    }

    if (localEnabled && hasServers) {
      return (
        <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
          Click Refresh to load server status
        </div>
      )
    }

    // Show basic info when not loaded yet
    return (
      <div className="space-y-3">
        {serverNames.map((serverName) => (
          <div
            key={serverName}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-4"
          >
            <Icon
              icon="octicon:mcp-16"
              className="h-4 w-4 flex-shrink-0 text-primary"
            />
            <span className="truncate font-medium">{serverName}</span>
            <Badge variant="outline" className="flex-shrink-0 text-xs">
              configured
            </Badge>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[80vw] max-w-4xl p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon icon="octicon:mcp-16" className="h-5 w-5" />
            MCP Servers
            <Switch
              checked={localEnabled}
              onCheckedChange={handleToggleEnabled}
              disabled={isTogglingEnabled}
            />
          </DialogTitle>
        </DialogHeader>

        {!localEnabled && hasServers && (
          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
            MCP servers are currently disabled. Enable them to use MCP tools in
            your conversations.
          </div>
        )}

        {!hasServers && (
          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
            No MCP servers configured. Configure servers in the agent settings
            to enable MCP tools.
          </div>
        )}

        <ScrollArea className="max-h-[500px]">{renderServerList()}</ScrollArea>

        {/* Footer */}
        {localEnabled && !isLoading && serverStatus && (
          <span className="text-sm text-muted-foreground">
            Total: {serverStatus.servers.length} servers,{' '}
            {serverStatus.totalToolsCount} tools
          </span>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Integrated MCPServerItem component
interface MCPServerItemProps {
  server: MCPServerStatus
  config: ParsedMCPConfig
  isOpen: boolean
  onToggle: () => void
}

function MCPServerItem({
  server,
  config,
  isOpen,
  onToggle,
}: MCPServerItemProps) {
  const serverConfig = config.mcpServers[server.name]

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onToggle}
      className="rounded-lg border border-border p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Icon
              icon={
                server.connected ? 'lucide:check-circle' : 'lucide:x-circle'
              }
              className={`h-4 w-4 flex-shrink-0 ${
                server.connected ? 'text-green-500' : 'text-red-500'
              }`}
            />
            <span className="truncate font-medium">{server.name}</span>
            <Badge variant="outline" className="flex-shrink-0 text-xs">
              {server.toolsCount} {server.toolsCount === 1 ? 'tool' : 'tools'}
            </Badge>
          </div>

          {server.error && (
            <div className="mt-1 text-xs text-red-500">{server.error}</div>
          )}
        </div>

        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto flex-shrink-0 p-1 hover:bg-transparent"
          >
            <Icon
              icon={isOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'}
              className="h-4 w-4"
            />
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className="mt-3 space-y-3">
          {/* Server config info */}
          <div className="space-y-2 text-sm">
            {serverConfig?.url && (
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                <Badge variant="secondary" className="w-fit text-xs">
                  URL
                </Badge>
                <code className="break-all rounded bg-muted px-1.5 py-0.5 text-xs">
                  {serverConfig.url}
                </code>
              </div>
            )}
            {serverConfig?.command && (
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                <Badge variant="secondary" className="w-fit text-xs">
                  Command
                </Badge>
                <code className="break-all rounded bg-muted px-1.5 py-0.5 text-xs">
                  {serverConfig.command}
                </code>
              </div>
            )}
            {serverConfig?.type && (
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                <Badge variant="secondary" className="w-fit text-xs">
                  Type
                </Badge>
                <span className="text-xs">{serverConfig.type}</span>
              </div>
            )}
          </div>

          {/* Tools list */}
          {server.tools.length > 0 && (
            <div>
              <div className="mb-2 text-xs font-medium text-muted-foreground">
                Available Tools:
              </div>
              <div className="space-y-2">
                {server.tools.map((tool) => (
                  <div
                    key={tool.name}
                    className="rounded-md border border-border bg-card p-2.5"
                  >
                    <div className="flex items-start gap-2">
                      <Icon
                        icon="lucide:wrench"
                        className="h-3.5 w-3.5 flex-shrink-0 text-primary"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <code className="block break-all text-xs font-medium">
                          {tool.name}
                        </code>
                        <p className="text-xs text-muted-foreground">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
