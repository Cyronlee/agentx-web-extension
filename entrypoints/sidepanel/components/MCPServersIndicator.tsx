import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { Agent } from '@/db'
import { parseAgentMCPConfig } from '@/db'
import { Server, Wrench } from 'lucide-react'
import { useMemo, useState } from 'react'

interface MCPServersIndicatorProps {
  agent: Agent | null
}

interface MCPServerConfig {
  url?: string
  command?: string
  args?: string[]
  env?: Record<string, string>
  type?: 'stdio' | 'http' | 'sse'
}

interface ParsedMCPConfig {
  mcpServers: Record<string, MCPServerConfig>
}

export function MCPServersIndicator({ agent }: MCPServersIndicatorProps) {
  const [open, setOpen] = useState(false)

  const mcpConfig = useMemo(() => {
    if (!agent || !agent.mcpServersEnabled) return null
    return parseAgentMCPConfig(agent) as ParsedMCPConfig | null
  }, [agent])

  const serverNames = useMemo(() => {
    if (!mcpConfig?.mcpServers) return []
    return Object.keys(mcpConfig.mcpServers)
  }, [mcpConfig])

  const toolsCount = serverNames.length

  if (!agent?.mcpServersEnabled || toolsCount === 0) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Server className="h-3.5 w-3.5" />
          <span>{toolsCount} MCP</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Active MCP Servers
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-4 pr-4">
            {serverNames.map((serverName, index) => {
              const serverConfig = mcpConfig?.mcpServers[serverName]
              return (
                <div key={serverName}>
                  {index > 0 && <Separator className="mb-4" />}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-primary" />
                      <span className="font-medium">{serverName}</span>
                    </div>
                    <div className="ml-6 space-y-1 text-sm text-muted-foreground">
                      {serverConfig?.url && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            URL
                          </Badge>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {serverConfig.url}
                          </code>
                        </div>
                      )}
                      {serverConfig?.command && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Command
                          </Badge>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {serverConfig.command}
                          </code>
                        </div>
                      )}
                      {serverConfig?.type && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Type
                          </Badge>
                          <span className="text-xs">{serverConfig.type}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

