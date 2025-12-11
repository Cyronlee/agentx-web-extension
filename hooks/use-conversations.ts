import { useCallback, useEffect, useState } from 'react'
import {
  createConversation,
  deleteConversation,
  ensureDefaultAgent,
  getAllConversations,
  getAgent,
  type Agent,
  type Conversation,
} from '@/db'

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
        // Ensure default agent exists
        const defaultAgent = await ensureDefaultAgent()
        const convs = await getAllConversations()

        if (convs.length === 0) {
          // No conversations exist, create initial one with default agent
          const newConv = await createConversation({
            title: formatConversationTitle(defaultAgent),
            agentId: defaultAgent.id,
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

  // Create a new conversation with an agent
  const createNewConversation = useCallback(async (agentId?: string) => {
    // Get agent (use default if not specified)
    let agent: Agent | undefined
    if (agentId) {
      agent = await getAgent(agentId)
    }
    if (!agent) {
      agent = await ensureDefaultAgent()
    }

    const newConv = await createConversation({
      title: formatConversationTitle(agent),
      agentId: agent.id,
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

// Helper to format conversation title with agent info and time
function formatConversationTitle(agent: Agent): string {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
  return `${agent.name} - ${dateStr} ${timeStr}`
}
