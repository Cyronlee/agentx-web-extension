import { storage } from '#imports'
import { useCallback, useEffect, useState } from 'react'

// MCP Server configuration (Cursor/Claude Desktop compatible format)
export interface MCPServerConfig {
  command?: string
  args?: string[]
  env?: Record<string, string>
  url?: string
  type?: 'stdio' | 'http' | 'sse'
}

export interface MCPConfig {
  mcpServers: Record<string, MCPServerConfig>
}

// Default empty config
const DEFAULT_MCP_CONFIG: MCPConfig = {
  mcpServers: {},
}

// Define storage item for MCP config
const mcpConfigStorage = storage.defineItem<MCPConfig>('local:mcpConfig', {
  fallback: DEFAULT_MCP_CONFIG,
})

export function useMCPConfig() {
  const [config, setConfigState] = useState<MCPConfig>(DEFAULT_MCP_CONFIG)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const stored = await mcpConfigStorage.getValue()
        setConfigState(stored)
        setError(null)
      } catch (err) {
        console.error('Failed to load MCP config:', err)
        setError('Failed to load MCP configuration')
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  // Update config from JSON string
  const setConfigFromJSON = async (jsonString: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonString) as MCPConfig

      // Validate structure
      if (!parsed.mcpServers || typeof parsed.mcpServers !== 'object') {
        throw new Error('Invalid MCP config: missing mcpServers object')
      }

      // Validate each server config
      for (const [name, serverConfig] of Object.entries(parsed.mcpServers)) {
        if (!serverConfig.command && !serverConfig.url) {
          throw new Error(
            `Invalid server config for "${name}": must have either "command" or "url"`
          )
        }
      }

      setConfigState(parsed)
      await mcpConfigStorage.setValue(parsed)
      setError(null)
      return true
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Invalid JSON format'
      setError(message)
      return false
    }
  }

  // Get config as JSON string (memoized to prevent useEffect re-runs)
  const getConfigAsJSON = useCallback((): string => {
    return JSON.stringify(config, null, 2)
  }, [config])

  // Clear config
  const clearConfig = async () => {
    setConfigState(DEFAULT_MCP_CONFIG)
    await mcpConfigStorage.removeValue()
    setError(null)
  }

  // Check if config has any servers
  const hasServers = Object.keys(config.mcpServers).length > 0

  // Get server names
  const serverNames = Object.keys(config.mcpServers)

  return {
    config,
    loading,
    error,
    setConfigFromJSON,
    getConfigAsJSON,
    clearConfig,
    hasServers,
    serverNames,
  }
}

// Standalone function to get MCP config (for use outside React components)
export async function getMCPConfig(): Promise<MCPConfig> {
  return mcpConfigStorage.getValue()
}

