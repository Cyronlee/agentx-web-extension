import { Router, type Request, type Response, type Router as RouterType } from 'express'
import type { MCPConfig } from '../types.js'
import { createMCPClients, closeMCPClients } from '../mcp/client.js'

const router: RouterType = Router()

// Interface for MCP server status response
interface MCPServerStatus {
  name: string
  connected: boolean
  toolsCount: number
  tools: {
    name: string
    description: string
  }[]
  error?: string
}

interface MCPStatusResponse {
  servers: MCPServerStatus[]
  totalToolsCount: number
}

/**
 * POST /api/mcp/status
 * Get status and tools information for all configured MCP servers
 */
router.post('/status', async (req: Request, res: Response) => {
  const requestId = `mcp_${Date.now()}_${Math.random().toString(36).substring(7)}`
  
  console.log(`[MCP][${requestId}] Status check requested`)
  
  const { mcpConfig } = req.body as { mcpConfig?: MCPConfig }
  
  if (!mcpConfig?.mcpServers || Object.keys(mcpConfig.mcpServers).length === 0) {
    console.log(`[MCP][${requestId}] No MCP servers configured`)
    return res.json({
      servers: [],
      totalToolsCount: 0,
    } satisfies MCPStatusResponse)
  }
  
  const servers: MCPServerStatus[] = []
  let totalToolsCount = 0
  
  // Try to connect to each server and get tools
  for (const [name, config] of Object.entries(mcpConfig.mcpServers)) {
    console.log(`[MCP][${requestId}] Checking server: ${name}`)
    
    try {
      // Create a single client for this server
      const clients = await createMCPClients({
        mcpServers: { [name]: config },
      })
      
      if (clients.length === 0) {
        servers.push({
          name,
          connected: false,
          toolsCount: 0,
          tools: [],
          error: 'Failed to create client',
        })
        continue
      }
      
      const client = clients[0]
      const tools = Object.entries(client.tools).map(([toolName, toolDef]) => {
        // Remove server prefix from tool name for display
        const displayName = toolName.startsWith(`${name}__`) 
          ? toolName.substring(name.length + 2)
          : toolName
        
        return {
          name: displayName,
          description: (toolDef as { description?: string }).description || 'No description',
        }
      })
      
      servers.push({
        name,
        connected: true,
        toolsCount: tools.length,
        tools,
      })
      
      totalToolsCount += tools.length
      
      console.log(`[MCP][${requestId}] Server ${name}: ${tools.length} tools found`)
      
      // Clean up
      await closeMCPClients(clients)
    } catch (error) {
      console.error(`[MCP][${requestId}] Error checking server ${name}:`, error)
      servers.push({
        name,
        connected: false,
        toolsCount: 0,
        tools: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
  
  console.log(`[MCP][${requestId}] Status check complete: ${servers.length} servers, ${totalToolsCount} total tools`)
  
  res.json({
    servers,
    totalToolsCount,
  } satisfies MCPStatusResponse)
})

export default router

