import type { UIMessage } from 'ai'
import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

// Database types
export interface Conversation {
  id: string
  title: string
  createdAt: number
  updatedAt: number
}

export interface StoredMessage {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  parts: UIMessage['parts']
  metadata?: unknown
  createdAt: number
}

interface ChatDBSchema extends DBSchema {
  conversations: {
    key: string
    value: Conversation
    indexes: { 'by-updatedAt': number }
  }
  messages: {
    key: string
    value: StoredMessage
    indexes: { 'by-conversationId': string }
  }
}

const DB_NAME = 'agentx-chat-db'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<ChatDBSchema> | null = null

async function getDB(): Promise<IDBPDatabase<ChatDBSchema>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<ChatDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create conversations store
      if (!db.objectStoreNames.contains('conversations')) {
        const conversationStore = db.createObjectStore('conversations', {
          keyPath: 'id',
        })
        conversationStore.createIndex('by-updatedAt', 'updatedAt')
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

// Conversation CRUD
export async function createConversation(
  conversation: Conversation
): Promise<Conversation> {
  const db = await getDB()
  await db.add('conversations', conversation)
  return conversation
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

// Message CRUD
export async function addMessage(message: StoredMessage): Promise<StoredMessage> {
  const db = await getDB()
  await db.add('messages', message)
  return message
}

export async function updateMessage(
  id: string,
  updates: Partial<Omit<StoredMessage, 'id' | 'conversationId'>>
): Promise<StoredMessage | undefined> {
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
): Promise<StoredMessage[]> {
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

// Utility: Convert UIMessage to StoredMessage
export function uiMessageToStoredMessage(
  message: UIMessage,
  conversationId: string
): StoredMessage {
  return {
    id: message.id,
    conversationId,
    role: message.role as 'user' | 'assistant' | 'system',
    parts: message.parts,
    metadata: message.metadata,
    createdAt: Date.now(),
  }
}

// Utility: Convert StoredMessage to UIMessage
export function storedMessageToUIMessage(message: StoredMessage): UIMessage {
  return {
    id: message.id,
    role: message.role,
    parts: message.parts,
    metadata: message.metadata,
  } as UIMessage
}

