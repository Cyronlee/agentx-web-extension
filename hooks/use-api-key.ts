import { storage } from '#imports'
import { useEffect, useState } from 'react'

interface ApiKeySettings {
  apiKey: string
}

// Define storage item for API key
const apiKeySettings = storage.defineItem<ApiKeySettings>('local:apiKeySettings', {
  fallback: {
    apiKey: '',
  },
})

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // Load API key on mount
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const settings = await apiKeySettings.getValue()
        setApiKeyState(settings.apiKey)
      } catch (error) {
        console.error('Failed to load API key:', error)
      } finally {
        setLoading(false)
      }
    }

    loadApiKey()
  }, [])

  // Update API key
  const setApiKey = async (key: string) => {
    setApiKeyState(key)
    try {
      await apiKeySettings.setValue({ apiKey: key })
    } catch (error) {
      console.error('Failed to save API key:', error)
    }
  }

  // Clear API key
  const clearApiKey = async () => {
    setApiKeyState('')
    try {
      await apiKeySettings.removeValue()
    } catch (error) {
      console.error('Failed to clear API key:', error)
    }
  }

  return {
    apiKey,
    loading,
    setApiKey,
    clearApiKey,
    hasApiKey: apiKey.length > 0,
  }
}

// Standalone function to get API key (for use outside React components)
export async function getApiKey(): Promise<string> {
  const settings = await apiKeySettings.getValue()
  return settings.apiKey
}

