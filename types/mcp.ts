export interface MCPServerConfig {
  url?: string
  command?: string
  args?: string[]
  env?: Record<string, string>
  type?: 'stdio' | 'http' | 'sse'
}

export interface ParsedMCPConfig {
  mcpServers: Record<string, MCPServerConfig>
}

export interface MCPServerStatus {
  name: string
  connected: boolean
  toolsCount: number
  tools: {
    name: string
    description: string
  }[]
  error?: string
}

export interface MCPStatusResponse {
  servers: MCPServerStatus[]
  totalToolsCount: number
}

