import { useChat, type UseChatOptions } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { nanoid } from 'nanoid'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  addMessage,
  createConversation,
  getConversation,
  getLastConversation,
  getMessagesByConversationId,
  storedMessageToUIMessage,
  uiMessageToStoredMessage,
  updateConversation,
  updateMessage,
  type Conversation,
} from '@/lib/db'

import { getApiKey } from './use-api-key'

const API_URL = 'https://express-ai-sdk-demo.vercel.app'

interface UseChatPersistenceOptions {
  conversationId?: string
}

export function useChatPersistence(options: UseChatPersistenceOptions = {}) {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const processedMessageIds = useRef<Set<string>>(new Set())
  const lastMessageCountRef = useRef(0)

  // Initialize conversation
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
          // Create new empty conversation
          conv = await createConversation({
            id: nanoid(),
            title: 'New Chat',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
        }

        setConversation(conv)
      } catch (err) {
        console.error('Failed to initialize conversation:', err)
        setError(err instanceof Error ? err : new Error('Failed to initialize'))
      } finally {
        setIsLoading(false)
      }
    }

    initConversation()
  }, [options.conversationId])

  // Create transport with dynamic API key
  const transport = new DefaultChatTransport({
    api: API_URL,
    headers: async () => {
      const apiKey = await getApiKey()
      return {
        Authorization: `Bearer ${apiKey}`,
      }
    },
  })

  // Use the chat hook
  const chatResult = useChat({
    id: conversation?.id,
    transport,
    onFinish: async ({ message }) => {
      // Save assistant message when streaming finishes
      if (conversation && message.role === 'assistant') {
        const existingMessage = processedMessageIds.current.has(message.id)
        if (existingMessage) {
          // Update the existing message with final content
          await updateMessage(message.id, {
            parts: message.parts,
            metadata: message.metadata,
          })
        } else {
          // Save new message
          await addMessage(uiMessageToStoredMessage(message, conversation.id))
          processedMessageIds.current.add(message.id)
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
              const title = textPart.text.slice(0, 50) + (textPart.text.length > 50 ? '...' : '')
              await updateConversation(conversation.id, { title })
              setConversation((prev) => (prev ? { ...prev, title } : prev))
            }
          }
        }
      }
    },
    onError: (err) => {
      console.error('Chat error:', err)
      setError(err instanceof Error ? err : new Error('Chat error'))
    },
  } as UseChatOptions)

  // Load initial messages from IndexedDB
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversation) return

      try {
        const storedMessages = await getMessagesByConversationId(conversation.id)
        if (storedMessages.length > 0) {
          const uiMessages = storedMessages.map(storedMessageToUIMessage)
          chatResult.setMessages(uiMessages)
          // Mark all loaded messages as processed
          storedMessages.forEach((msg) => processedMessageIds.current.add(msg.id))
          lastMessageCountRef.current = storedMessages.length
        }
      } catch (err) {
        console.error('Failed to load messages:', err)
      }
    }

    loadMessages()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id])

  // Custom sendMessage that saves user message first
  const sendMessage = useCallback(
    async (messageOptions: Parameters<typeof chatResult.sendMessage>[0]) => {
      if (!conversation) {
        console.error('No conversation available')
        return
      }

      // Create and save user message
      const userMessageId = nanoid()
      const userMessage: UIMessage = {
        id: userMessageId,
        role: 'user',
        parts: [{ type: 'text', text: messageOptions.text || '' }],
      }

      // Save to IndexedDB
      await addMessage(uiMessageToStoredMessage(userMessage, conversation.id))
      processedMessageIds.current.add(userMessageId)
      lastMessageCountRef.current++

      // Update conversation timestamp
      await updateConversation(conversation.id, { updatedAt: Date.now() })

      // Send to AI
      chatResult.sendMessage(messageOptions)
    },
    [conversation, chatResult]
  )

  // Create new conversation
  const newConversation = useCallback(async () => {
    const conv = await createConversation({
      id: nanoid(),
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    setConversation(conv)
    chatResult.setMessages([])
    processedMessageIds.current.clear()
    lastMessageCountRef.current = 0
    return conv
  }, [chatResult])

  return {
    ...chatResult,
    sendMessage,
    conversation,
    isLoading,
    error,
    newConversation,
  }
}

