import type { UIMessage } from 'ai'
import type { DBSchema } from 'idb'

// Entity types
export interface Agent {
  id: string
  name: string
  icon: string // URL to icon image
  systemPrompt: string
  mcpServersEnabled: boolean
  mcpServers: string // JSON string of MCP config
  createdAt: number
  updatedAt: number
}

export interface Conversation {
  id: string
  title: string
  agentId: string
  createdAt: number
  updatedAt: number
}

export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  parts: UIMessage['parts']
  metadata?: unknown
  createdAt: number
}

export interface MagicTemplate {
  id: string
  name: string
  template: string
  createdAt: number
  updatedAt: number
}

// IndexedDB schema
export interface ChatDBSchema extends DBSchema {
  agents: {
    key: string
    value: Agent
    indexes: { 'by-updatedAt': number }
  }
  conversations: {
    key: string
    value: Conversation
    indexes: { 'by-updatedAt': number; 'by-agentId': string }
  }
  messages: {
    key: string
    value: Message
    indexes: { 'by-conversationId': string }
  }
  magicTemplates: {
    key: string
    value: MagicTemplate
    indexes: { 'by-updatedAt': number }
  }
}

export const DB_NAME = 'agentx-chat-db'
export const DB_VERSION = 3

// Default agent
export const DEFAULT_AGENT: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'General Assistant',
  icon: 'https://api.dicebear.com/9.x/bottts/svg?seed=assistant',
  systemPrompt: 'You are a helpful AI assistant. Be concise and helpful in your responses.',
  mcpServersEnabled: false,
  mcpServers: '{"mcpServers":{}}',
}
