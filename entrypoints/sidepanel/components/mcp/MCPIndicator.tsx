import { PromptInputButton } from '@/components/ai-elements/prompt-input'
import type { Agent } from '@/db'
import { Icon } from '@iconify/react'
import { useMemo } from 'react'

interface MCPIndicatorProps {
  agent: Agent | null
  toolsCount?: number
  isLoading?: boolean
  onClick: () => void
}

export function MCPIndicator({
  agent,
  toolsCount = 0,
  isLoading = false,
  onClick,
}: MCPIndicatorProps) {
  const hasServers = useMemo(() => {
    if (!agent?.mcpServers) return false
    try {
      const config = JSON.parse(agent.mcpServers)
      return Object.keys(config.mcpServers || {}).length > 0
    } catch {
      return false
    }
  }, [agent?.mcpServers])

  // Always show indicator if agent exists
  if (!agent) {
    return null
  }

  const isEnabled = agent.mcpServersEnabled && hasServers

  return (
    <PromptInputButton
      className="!rounded-full text-foreground cursor-pointer"
      variant="outline"
      onClick={onClick}
      type="button"
    >
      <Icon icon="octicon:mcp-16" className={!isEnabled ? 'opacity-40' : ''} />
      {hasServers && isEnabled && (
        <>
          {isLoading ? (
            <Icon icon="lucide:loader-2" className="h-4 w-4 animate-spin" />
          ) : (
            toolsCount > 0 && (
              <span>
                {toolsCount} {toolsCount === 1 ? 'Tool' : 'Tools'}
              </span>
            )
          )}
        </>
      )}
    </PromptInputButton>
  )
}
