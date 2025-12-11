import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage, type FinishReason } from 'ai'
import { nanoid } from 'nanoid'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  addMessage,
  createConversation,
  ensureDefaultAgent,
  getAgent,
  getConversation,
  getLastConversation,
  getMessagesByConversationId,
  messageToUIMessage,
  parseAgentMCPConfig,
  uiMessageToMessage,
  updateConversation,
  updateMessage,
  type Agent,
  type Conversation,
} from '@/db'

import { getApiKeys } from './use-api-key'

// Backend API URL
const API_URL = 'http://localhost:3001/api/chat'

interface UseChatPersistenceOptions {
  conversationId?: string
  onConversationUpdate?: () => void
  onError?: (error: Error) => void
}

// Finish reasons that indicate the message is complete and should be persisted
const TERMINAL_FINISH_REASONS: FinishReason[] = [
  'stop',
  'length',
  'content-filter',
  'error',
  'other',
]

export function useChatPersistence(options: UseChatPersistenceOptions = {}) {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [agent, setAgent] = useState<Agent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const processedMessageIds = useRef<Set<string>>(new Set())
  const lastMessageCountRef = useRef(0)

  // Initialize conversation and load agent
  useEffect(() => {
    const initConversation = async () => {
      try {
        setIsLoading(true)
        setError(null)

        let conv: Conversation | undefined

        if (options.conversationId) {
          // Load specific conversation
          conv = await getConversation(options.conversationId)
        } else {
          // Load last conversation or create new one
          conv = await getLastConversation()
        }

        if (!conv) {
          // Create new empty conversation with default agent
          const defaultAgent = await ensureDefaultAgent()
          conv = await createConversation({
            title: 'New Chat',
            agentId: defaultAgent.id,
          })
          setAgent(defaultAgent)
        } else {
          // Load the agent for this conversation
          const loadedAgent = await getAgent(conv.agentId)
          setAgent(loadedAgent || null)
        }

        setConversation(conv)
      } catch (err: unknown) {
        console.error('Failed to initialize conversation:', err)
        setError(err instanceof Error ? err : new Error('Failed to initialize'))
      } finally {
        setIsLoading(false)
      }
    }

    initConversation()
  }, [options.conversationId])

  // Create transport with dynamic API keys and agent config
  const transport = new DefaultChatTransport({
    api: API_URL,
    body: async () => {
      const apiKeys = await getApiKeys()

      // Get MCP config from agent if enabled
      const mcpConfig = agent ? parseAgentMCPConfig(agent) : null

      return {
        apiKeys,
        mcpConfig,
        systemPrompt: agent?.systemPrompt || undefined,
      }
    },
  })

  // Use the chat hook
  const chatResult = useChat({
    id: conversation?.id,
    transport,
    onFinish: async (finishOptions: {
      message: UIMessage
      finishReason?: FinishReason
    }) => {
      const { message, finishReason } = finishOptions

      // Only save when the message is truly complete
      // Skip saving when finishReason is 'tool-calls' as the conversation will continue
      if (!finishReason || !TERMINAL_FINISH_REASONS.includes(finishReason)) {
        console.log(
          `[useChatPersistence] Skipping save: finishReason=${finishReason}`
        )
        return
      }

      // Save assistant message when streaming finishes
      if (conversation && message.role === 'assistant') {
        const existingMessage = processedMessageIds.current.has(message.id)
        if (existingMessage) {
          // Update the existing message with final content
          await updateMessage(message.id, {
            parts: message.parts,
            metadata: message.metadata,
          })
          console.log(`[useChatPersistence] Updated message: ${message.id}`)
        } else {
          // Save new message
          await addMessage(uiMessageToMessage(message, conversation.id))
          processedMessageIds.current.add(message.id)
          console.log(`[useChatPersistence] Saved new message: ${message.id}`)
        }

        // Update conversation title if this is the first exchange
        if (lastMessageCountRef.current <= 2) {
          const firstUserMessage = chatResult.messages.find(
            (m) => m.role === 'user'
          )
          if (firstUserMessage) {
            const textPart = firstUserMessage.parts.find(
              (p) => p.type === 'text'
            )
            if (textPart && 'text' in textPart) {
              const title =
                textPart.text.slice(0, 50) +
                (textPart.text.length > 50 ? '...' : '')
              await updateConversation(conversation.id, { title })
              setConversation((prev) => (prev ? { ...prev, title } : prev))
              // Notify parent to refresh conversations list
              options.onConversationUpdate?.()
            }
          }
        }
      }
    },
    onError: (err: Error) => {
      console.error('Chat error:', err)
      setError(err)
      options.onError?.(err)
    },
  })

  // Load initial messages from IndexedDB
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversation) return

      try {
        const storedMessages = await getMessagesByConversationId(
          conversation.id
        )
        if (storedMessages.length > 0) {
          const uiMessages = storedMessages.map(messageToUIMessage)
          chatResult.setMessages(uiMessages)
          // Mark all loaded messages as processed
          storedMessages.forEach((msg) =>
            processedMessageIds.current.add(msg.id)
          )
          lastMessageCountRef.current = storedMessages.length
        }
      } catch (err: unknown) {
        console.error('Failed to load messages:', err)
      }
    }

    loadMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id])

  // Custom sendMessage that saves user message first
  const sendMessage = useCallback(
    async (messageOptions?: Parameters<typeof chatResult.sendMessage>[0]) => {
      if (!conversation) {
        console.error('No conversation available')
        return
      }

      // Extract parts from messageOptions
      const parts =
        messageOptions && 'parts' in messageOptions
          ? messageOptions.parts
          : undefined
      const hasParts = parts && parts.length > 0

      if (hasParts && parts) {
        const userMessageId = nanoid()

        const userMessage: UIMessage = {
          id: userMessageId,
          role: 'user',
          parts: parts,
        }

        // Save to IndexedDB
        await addMessage(uiMessageToMessage(userMessage, conversation.id))
        processedMessageIds.current.add(userMessageId)
        lastMessageCountRef.current++

        // Update conversation timestamp
        await updateConversation(conversation.id, { updatedAt: Date.now() })
      }

      // Send to AI
      chatResult.sendMessage(messageOptions)
    },
    [conversation, chatResult]
  )

  // Create new conversation
  const newConversation = useCallback(async () => {
    const defaultAgent = await ensureDefaultAgent()
    const conv = await createConversation({
      title: 'New Chat',
      agentId: defaultAgent.id,
    })
    setConversation(conv)
    setAgent(defaultAgent)
    chatResult.setMessages([])
    processedMessageIds.current.clear()
    lastMessageCountRef.current = 0
    return conv
  }, [chatResult])

  // Refresh agent data
  const refreshAgent = useCallback(async () => {
    if (!conversation) return
    const loadedAgent = await getAgent(conversation.agentId)
    setAgent(loadedAgent || null)
  }, [conversation])

  return {
    ...chatResult,
    sendMessage,
    conversation,
    agent,
    isLoading,
    error,
    newConversation,
    refreshAgent,
  }
}
