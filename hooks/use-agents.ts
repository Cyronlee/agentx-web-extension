import { useCallback, useEffect, useState } from 'react'
import {
  createAgent,
  deleteAgent,
  ensureDefaultAgent,
  getAllAgents,
  getAgent,
  updateAgent,
  type Agent,
} from '@/db'

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load all agents on mount
  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true)
        // Ensure default agent exists
        await ensureDefaultAgent()
        const allAgents = await getAllAgents()
        setAgents(allAgents)
        setError(null)
      } catch (err) {
        console.error('Failed to load agents:', err)
        setError(err instanceof Error ? err : new Error('Failed to load agents'))
      } finally {
        setLoading(false)
      }
    }

    loadAgents()
  }, [])

  // Create a new agent
  const addAgent = useCallback(
    async (
      agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Agent> => {
      const newAgent = await createAgent(agentData)
      setAgents((prev) => [newAgent, ...prev])
      return newAgent
    },
    []
  )

  // Update an existing agent
  const editAgent = useCallback(
    async (
      id: string,
      updates: Partial<Omit<Agent, 'id' | 'createdAt'>>
    ): Promise<Agent | undefined> => {
      const updated = await updateAgent(id, updates)
      if (updated) {
        setAgents((prev) =>
          prev.map((agent) => (agent.id === id ? updated : agent))
        )
      }
      return updated
    },
    []
  )

  // Delete an agent
  const removeAgent = useCallback(async (id: string): Promise<void> => {
    await deleteAgent(id)
    setAgents((prev) => prev.filter((agent) => agent.id !== id))
  }, [])

  // Refresh agents list
  const refreshAgents = useCallback(async () => {
    const allAgents = await getAllAgents()
    setAgents(allAgents)
  }, [])

  // Get a single agent by ID
  const getAgentById = useCallback(async (id: string): Promise<Agent | undefined> => {
    return getAgent(id)
  }, [])

  return {
    agents,
    loading,
    error,
    addAgent,
    editAgent,
    removeAgent,
    refreshAgents,
    getAgentById,
  }
}

