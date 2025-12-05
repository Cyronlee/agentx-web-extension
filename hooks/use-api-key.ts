import { storage } from '#imports'
import { useEffect, useState } from 'react'

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

const apiKeySettings = storage.defineItem<ProviderApiKeys>(
  'local:apiKeySettings',
  {
    fallback: DEFAULT_API_KEYS,
  }
)

export function useApiKey() {
  const [apiKeys, setApiKeysState] = useState<ProviderApiKeys>(DEFAULT_API_KEYS)
  const [loading, setLoading] = useState(true)

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

  const setApiKey = async (provider: keyof ProviderApiKeys, key: string) => {
    const newKeys = { ...apiKeys, [provider]: key }
    setApiKeysState(newKeys)
    try {
      await apiKeySettings.setValue(newKeys)
    } catch (error) {
      console.error('Failed to save API key:', error)
    }
  }

  const setAllApiKeys = async (keys: Partial<ProviderApiKeys>) => {
    const newKeys = { ...apiKeys, ...keys }
    setApiKeysState(newKeys)
    try {
      await apiKeySettings.setValue(newKeys)
    } catch (error) {
      console.error('Failed to save API keys:', error)
    }
  }

  const clearApiKeys = async () => {
    setApiKeysState(DEFAULT_API_KEYS)
    try {
      await apiKeySettings.removeValue()
    } catch (error) {
      console.error('Failed to clear API keys:', error)
    }
  }

  return {
    apiKeys,
    setApiKey,
    setAllApiKeys,
    clearApiKeys,
    loading,
  }
}

export async function getApiKeys(): Promise<ProviderApiKeys> {
  return apiKeySettings.getValue()
}
