import { useCallback, useEffect, useState } from 'react'
import { nanoid } from 'nanoid'
import {
  createConversation,
  deleteConversation,
  getAllConversations,
  type Conversation,
} from '@/lib/db'

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null)
  const [loading, setLoading] = useState(true)

  // Load all conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true)
        const convs = await getAllConversations()

        if (convs.length === 0) {
          // No conversations exist, create initial one
          const newConv = await createConversation({
            id: nanoid(),
            title: 'New Chat',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
          setConversations([newConv])
          setCurrentConversationId(newConv.id)
        } else {
          setConversations(convs)
          // Set current to most recent if not set
          if (!currentConversationId) {
            setCurrentConversationId(convs[0].id)
          }
        }
      } catch (err) {
        console.error('Failed to load conversations:', err)
      } finally {
        setLoading(false)
      }
    }

    loadConversations()
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Create a new conversation
  const createNewConversation = useCallback(async () => {
    const newConv = await createConversation({
      id: nanoid(),
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    setConversations((prev) => [newConv, ...prev])
    setCurrentConversationId(newConv.id)

    return newConv
  }, [])

  // Delete a conversation
  const removeConversation = useCallback(
    async (id: string) => {
      await deleteConversation(id)
      setConversations((prev) => prev.filter((c) => c.id !== id))

      // If deleting current, switch to first available
      if (currentConversationId === id) {
        const remaining = conversations.filter((c) => c.id !== id)
        if (remaining.length > 0) {
          setCurrentConversationId(remaining[0].id)
        } else {
          // Create a new conversation if none left
          await createNewConversation()
        }
      }
    },
    [currentConversationId, conversations, createNewConversation]
  )

  // Select a conversation
  const selectConversation = useCallback((id: string) => {
    setCurrentConversationId(id)
  }, [])

  // Refresh conversations list
  const refreshConversations = useCallback(async () => {
    const convs = await getAllConversations()
    setConversations(convs)
  }, [])

  // Get current conversation
  const currentConversation =
    conversations.find((c) => c.id === currentConversationId) || null

  return {
    conversations,
    currentConversation,
    currentConversationId,
    loading,
    createNewConversation,
    removeConversation,
    selectConversation,
    refreshConversations,
  }
}

