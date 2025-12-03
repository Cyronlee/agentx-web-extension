import { storage } from '#imports'
import { useEffect, useState } from 'react'

// Provider API keys
export interface ProviderApiKeys {
  aiGateway: string
  google: string
  openai: string
  anthropic: string
}

const DEFAULT_API_KEYS: ProviderApiKeys = {
  aiGateway: '',
  google: '',
  openai: '',
  anthropic: '',
}

// Define storage item for API keys
const apiKeySettings = storage.defineItem<ProviderApiKeys>('local:apiKeySettings', {
  fallback: DEFAULT_API_KEYS,
})

export function useApiKey() {
  const [apiKeys, setApiKeysState] = useState<ProviderApiKeys>(DEFAULT_API_KEYS)
  const [loading, setLoading] = useState(true)

  // Load API keys on mount
  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        const settings = await apiKeySettings.getValue()
        setApiKeysState(settings)
      } catch (error) {
        console.error('Failed to load API keys:', error)
      } finally {
        setLoading(false)
      }
    }

    loadApiKeys()
  }, [])

  // Update a specific provider's API key
  const setApiKey = async (provider: keyof ProviderApiKeys, key: string) => {
    const newKeys = { ...apiKeys, [provider]: key }
    setApiKeysState(newKeys)
    try {
      await apiKeySettings.setValue(newKeys)
    } catch (error) {
      console.error('Failed to save API key:', error)
    }
  }

  // Update all API keys at once
  const setAllApiKeys = async (keys: Partial<ProviderApiKeys>) => {
    const newKeys = { ...apiKeys, ...keys }
    setApiKeysState(newKeys)
    try {
      await apiKeySettings.setValue(newKeys)
    } catch (error) {
      console.error('Failed to save API keys:', error)
    }
  }

  // Clear all API keys
  const clearApiKeys = async () => {
    setApiKeysState(DEFAULT_API_KEYS)
    try {
      await apiKeySettings.removeValue()
    } catch (error) {
      console.error('Failed to clear API keys:', error)
    }
  }

  // Legacy: get primary API key (aiGateway for backward compatibility)
  const apiKey = apiKeys.aiGateway

  // Legacy: set primary API key
  const setLegacyApiKey = async (key: string) => {
    await setApiKey('aiGateway', key)
  }

  // Legacy: clear primary API key
  const clearApiKey = async () => {
    await setApiKey('aiGateway', '')
  }

  return {
    // New multi-provider API
    apiKeys,
    setApiKey,
    setAllApiKeys,
    clearApiKeys,
    loading,
    // Legacy single-key API (backward compatible)
    apiKey,
    setApiKey: setLegacyApiKey,
    clearApiKey,
    hasApiKey: apiKeys.aiGateway.length > 0,
  }
}

// Standalone function to get API keys (for use outside React components)
export async function getApiKeys(): Promise<ProviderApiKeys> {
  return apiKeySettings.getValue()
}

// Legacy standalone function (backward compatible)
export async function getApiKey(): Promise<string> {
  const keys = await getApiKeys()
  return keys.aiGateway
}

