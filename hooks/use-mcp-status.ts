import type { ParsedMCPConfig, MCPStatusResponse } from '@/types/mcp'
import useSWR from 'swr'

async function fetchMCPStatus(
  mcpConfig: ParsedMCPConfig
): Promise<MCPStatusResponse> {
  const response = await fetch('http://localhost:3001/api/mcp/status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mcpConfig }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

interface UseMCPStatusOptions {
  mcpConfig: ParsedMCPConfig | null
  enabled: boolean
}

export function useMCPStatus({ mcpConfig, enabled }: UseMCPStatusOptions) {
  const { data, error, isLoading, mutate } = useSWR<MCPStatusResponse>(
    // Only fetch when enabled and mcpConfig exists
    enabled && mcpConfig ? ['mcp-status', mcpConfig] : null,
    ([_, config]) => fetchMCPStatus(config as ParsedMCPConfig),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  )

  return {
    serverStatus: data ?? null,
    error,
    isLoading,
    refresh: mutate,
  }
}
