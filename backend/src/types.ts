import type { UIMessage } from 'ai'

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

// Provider API keys
export interface ProviderApiKeys {
  aiGateway?: string
  google?: string
  openai?: string
  anthropic?: string
}

// Chat request body
export interface ChatRequestBody {
  messages: UIMessage[]
  mcpConfig?: MCPConfig
  apiKeys?: ProviderApiKeys
  model?: string
  systemPrompt?: string
}

// Human-in-the-loop approval states
export const APPROVAL = {
  YES: 'Yes, confirmed.',
  NO: 'No, denied.',
} as const

export type ApprovalState = (typeof APPROVAL)[keyof typeof APPROVAL]
