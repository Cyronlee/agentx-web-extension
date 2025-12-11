import type { UIMessage } from 'ai'
import { openDB, type IDBPDatabase } from 'idb'
import { nanoid } from 'nanoid'

import {
  type ChatDBSchema,
  type Agent,
  type Conversation,
  type Message,
  DB_NAME,
  DB_VERSION,
  DEFAULT_AGENT,
} from './schema'

// Database instance singleton
let dbInstance: IDBPDatabase<ChatDBSchema> | null = null

async function getDB(): Promise<IDBPDatabase<ChatDBSchema>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<ChatDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Create agents store (new in v2)
      if (!db.objectStoreNames.contains('agents')) {
        const agentStore = db.createObjectStore('agents', {
          keyPath: 'id',
        })
        agentStore.createIndex('by-updatedAt', 'updatedAt')
      }

      // Create conversations store
      if (!db.objectStoreNames.contains('conversations')) {
        const conversationStore = db.createObjectStore('conversations', {
          keyPath: 'id',
        })
        conversationStore.createIndex('by-updatedAt', 'updatedAt')
        conversationStore.createIndex('by-agentId', 'agentId')
      } else if (oldVersion < 2) {
        // Add by-agentId index for existing store
        const tx = db.transaction('conversations', 'readwrite')
        const store = tx.objectStore('conversations')
        if (!store.indexNames.contains('by-agentId')) {
          store.createIndex('by-agentId', 'agentId')
        }
      }

      // Create messages store
      if (!db.objectStoreNames.contains('messages')) {
        const messageStore = db.createObjectStore('messages', {
          keyPath: 'id',
        })
        messageStore.createIndex('by-conversationId', 'conversationId')
      }
    },
  })

  return dbInstance
}

// ============ Agent CRUD ============

export async function createAgent(
  agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Agent> {
  const db = await getDB()
  const now = Date.now()
  const newAgent: Agent = {
    ...agent,
    id: nanoid(),
    createdAt: now,
    updatedAt: now,
  }
  await db.add('agents', newAgent)
  return newAgent
}

export async function getAgent(id: string): Promise<Agent | undefined> {
  const db = await getDB()
  return db.get('agents', id)
}

export async function getAllAgents(): Promise<Agent[]> {
  const db = await getDB()
  const agents = await db.getAllFromIndex('agents', 'by-updatedAt')
  // Return in descending order (most recent first)
  return agents.reverse()
}

export async function updateAgent(
  id: string,
  updates: Partial<Omit<Agent, 'id' | 'createdAt'>>
): Promise<Agent | undefined> {
  const db = await getDB()
  const agent = await db.get('agents', id)
  if (!agent) return undefined

  const updated: Agent = {
    ...agent,
    ...updates,
    updatedAt: Date.now(),
  }
  await db.put('agents', updated)
  return updated
}

export async function deleteAgent(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('agents', id)
}

// Initialize default agent if none exists
export async function ensureDefaultAgent(): Promise<Agent> {
  const agents = await getAllAgents()
  if (agents.length === 0) {
    return createAgent(DEFAULT_AGENT)
  }
  return agents[0]
}

// ============ Conversation CRUD ============

export async function createConversation(
  conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'> & {
    id?: string
    createdAt?: number
    updatedAt?: number
  }
): Promise<Conversation> {
  const db = await getDB()
  const now = Date.now()
  const newConversation: Conversation = {
    id: conversation.id || nanoid(),
    title: conversation.title,
    agentId: conversation.agentId,
    createdAt: conversation.createdAt || now,
    updatedAt: conversation.updatedAt || now,
  }
  await db.add('conversations', newConversation)
  return newConversation
}

export async function getConversation(
  id: string
): Promise<Conversation | undefined> {
  const db = await getDB()
  return db.get('conversations', id)
}

export async function getAllConversations(): Promise<Conversation[]> {
  const db = await getDB()
  const conversations = await db.getAllFromIndex(
    'conversations',
    'by-updatedAt'
  )
  // Return in descending order (most recent first)
  return conversations.reverse()
}

export async function getConversationsByAgentId(
  agentId: string
): Promise<Conversation[]> {
  const db = await getDB()
  const conversations = await db.getAllFromIndex(
    'conversations',
    'by-agentId',
    agentId
  )
  return conversations.sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function getLastConversation(): Promise<Conversation | undefined> {
  const conversations = await getAllConversations()
  return conversations[0]
}

export async function updateConversation(
  id: string,
  updates: Partial<Omit<Conversation, 'id'>>
): Promise<Conversation | undefined> {
  const db = await getDB()
  const conversation = await db.get('conversations', id)
  if (!conversation) return undefined

  const updated = {
    ...conversation,
    ...updates,
    updatedAt: Date.now(),
  }
  await db.put('conversations', updated)
  return updated
}

export async function deleteConversation(id: string): Promise<void> {
  const db = await getDB()
  // Delete all messages in the conversation first
  await deleteMessagesByConversationId(id)
  // Then delete the conversation
  await db.delete('conversations', id)
}

// ============ Message CRUD ============

export async function addMessage(message: Message): Promise<Message> {
  const db = await getDB()
  await db.add('messages', message)
  return message
}

export async function updateMessage(
  id: string,
  updates: Partial<Omit<Message, 'id' | 'conversationId'>>
): Promise<Message | undefined> {
  const db = await getDB()
  const message = await db.get('messages', id)
  if (!message) return undefined

  const updated = {
    ...message,
    ...updates,
  }
  await db.put('messages', updated)
  return updated
}

export async function getMessagesByConversationId(
  conversationId: string
): Promise<Message[]> {
  const db = await getDB()
  const messages = await db.getAllFromIndex(
    'messages',
    'by-conversationId',
    conversationId
  )
  // Sort by createdAt ascending
  return messages.sort((a, b) => a.createdAt - b.createdAt)
}

export async function deleteMessagesByConversationId(
  conversationId: string
): Promise<void> {
  const db = await getDB()
  const messages = await db.getAllFromIndex(
    'messages',
    'by-conversationId',
    conversationId
  )
  const tx = db.transaction('messages', 'readwrite')
  await Promise.all([
    ...messages.map((msg) => tx.store.delete(msg.id)),
    tx.done,
  ])
}

// ============ Utility Functions ============

// Utility: Convert UIMessage to Message
export function uiMessageToMessage(
  message: UIMessage,
  conversationId: string
): Message {
  return {
    id: message.id,
    conversationId,
    role: message.role as 'user' | 'assistant' | 'system',
    parts: message.parts,
    metadata: message.metadata,
    createdAt: Date.now(),
  }
}

// Utility: Convert Message to UIMessage
export function messageToUIMessage(message: Message): UIMessage {
  return {
    id: message.id,
    role: message.role,
    parts: message.parts,
    metadata: message.metadata,
  } as UIMessage
}

// Utility: Parse MCP config from agent
export function parseAgentMCPConfig(agent: Agent): {
  mcpServers: Record<string, unknown>
} | null {
  if (!agent.mcpServersEnabled || !agent.mcpServers) {
    return null
  }
  try {
    return JSON.parse(agent.mcpServers)
  } catch {
    return null
  }
}
