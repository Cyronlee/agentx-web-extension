import { experimental_createMCPClient as createMCPClient } from '@ai-sdk/mcp'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { tool, type ToolSet } from 'ai'
import { z } from 'zod'
import type { MCPConfig, MCPServerConfig } from '../types.js'

export interface MCPClientInstance {
  name: string
  client: Awaited<ReturnType<typeof createMCPClient>> | Client
  tools: ToolSet
  isStdio: boolean
}

/**
 * Create MCP clients from configuration
 */
export async function createMCPClients(
  config: MCPConfig
): Promise<MCPClientInstance[]> {
  const clients: MCPClientInstance[] = []

  for (const [name, serverConfig] of Object.entries(config.mcpServers)) {
    try {
      const clientInstance = await createMCPClientFromConfig(name, serverConfig)
      if (clientInstance) {
        clients.push(clientInstance)
        console.log(`[MCP] Connected to server: ${name}`)
      }
    } catch (error) {
      console.error(`[MCP] Failed to connect to server ${name}:`, error)
    }
  }

  return clients
}

/**
 * Create a single MCP client from server config
 */
async function createMCPClientFromConfig(
  name: string,
  config: MCPServerConfig
): Promise<MCPClientInstance | null> {
  // Stdio transport (local servers) - use @modelcontextprotocol/sdk
  if (config.command) {
    const transport = new StdioClientTransport({
      command: config.command,
      args: config.args || [],
      env: config.env,
    })

    const client = new Client({
      name: 'agentx-mcp-client',
      version: '1.0.0',
    })

    await client.connect(transport)

    // Get tools from stdio client
    const toolsResult = await client.listTools()
    const tools: ToolSet = {}

    for (const mcpTool of toolsResult.tools) {
      // Create tool without execute function for HITL
      tools[mcpTool.name] = tool({
        description: mcpTool.description || '',
        inputSchema: mcpTool.inputSchema
          ? z.object(convertJsonSchemaToZod(mcpTool.inputSchema as Record<string, unknown>))
          : z.object({}),
        // No execute - will be handled manually for HITL
      })
    }

    return {
      name,
      client,
      tools,
      isStdio: true,
    }
  }

  // HTTP transport
  if (config.url && (config.type === 'http' || !config.type)) {
    const client = await createMCPClient({
      transport: {
        type: 'http',
        url: config.url,
      },
    })

    const mcpTools = await client.tools()

    // Remove execute functions from all tools to enable HITL
    const hitlTools: ToolSet = {}
    for (const [toolName, mcpTool] of Object.entries(mcpTools)) {
      // Access the inputSchema from the tool definition
      const toolDef = mcpTool as { description?: string; inputSchema?: z.ZodTypeAny }
      hitlTools[toolName] = tool({
        description: toolDef.description || '',
        inputSchema: toolDef.inputSchema || z.object({}),
        // No execute - will be handled manually for HITL
      })
    }

    return {
      name,
      client,
      tools: hitlTools,
      isStdio: false,
    }
  }

  // SSE transport
  if (config.url && config.type === 'sse') {
    const client = await createMCPClient({
      transport: {
        type: 'sse',
        url: config.url,
      },
    })

    const mcpTools = await client.tools()

    // Remove execute functions from all tools to enable HITL
    const hitlTools: ToolSet = {}
    for (const [toolName, mcpTool] of Object.entries(mcpTools)) {
      // Access the inputSchema from the tool definition
      const toolDef = mcpTool as { description?: string; inputSchema?: z.ZodTypeAny }
      hitlTools[toolName] = tool({
        description: toolDef.description || '',
        inputSchema: toolDef.inputSchema || z.object({}),
        // No execute - will be handled manually for HITL
      })
    }

    return {
      name,
      client,
      tools: hitlTools,
      isStdio: false,
    }
  }

  console.warn(`[MCP] Invalid config for server ${name}`)
  return null
}

/**
 * Convert JSON Schema to Zod schema (simplified)
 */
function convertJsonSchemaToZod(
  schema: Record<string, unknown>
): Record<string, z.ZodTypeAny> {
  const result: Record<string, z.ZodTypeAny> = {}

  const properties = schema.properties as Record<string, unknown> | undefined
  const required = (schema.required as string[]) || []

  if (!properties) {
    return result
  }

  for (const [key, propSchema] of Object.entries(properties)) {
    const prop = propSchema as Record<string, unknown>
    let zodType: z.ZodTypeAny

    switch (prop.type) {
      case 'string':
        zodType = z.string()
        if (prop.description) {
          zodType = zodType.describe(prop.description as string)
        }
        break
      case 'number':
      case 'integer':
        zodType = z.number()
        if (prop.description) {
          zodType = zodType.describe(prop.description as string)
        }
        break
      case 'boolean':
        zodType = z.boolean()
        if (prop.description) {
          zodType = zodType.describe(prop.description as string)
        }
        break
      case 'array':
        zodType = z.array(z.unknown())
        if (prop.description) {
          zodType = zodType.describe(prop.description as string)
        }
        break
      case 'object':
        zodType = z.record(z.unknown())
        if (prop.description) {
          zodType = zodType.describe(prop.description as string)
        }
        break
      default:
        zodType = z.unknown()
    }

    if (!required.includes(key)) {
      zodType = zodType.optional()
    }

    result[key] = zodType
  }

  return result
}

/**
 * Merge tools from multiple MCP clients
 * Prefixes tool names with server name to avoid conflicts
 */
export function mergeTools(clients: MCPClientInstance[]): ToolSet {
  const merged: ToolSet = {}

  for (const { name, tools } of clients) {
    for (const [toolName, toolDef] of Object.entries(tools)) {
      // Use format: serverName__toolName
      const prefixedName = `${name}__${toolName}`
      merged[prefixedName] = toolDef
    }
  }

  return merged
}

/**
 * Execute a tool on the appropriate MCP client
 */
export async function executeMCPTool(
  clients: MCPClientInstance[],
  fullToolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  // Parse server name and tool name from prefixed format
  const separatorIndex = fullToolName.indexOf('__')
  if (separatorIndex === -1) {
    throw new Error(`Invalid tool name format: ${fullToolName}`)
  }

  const serverName = fullToolName.substring(0, separatorIndex)
  const toolName = fullToolName.substring(separatorIndex + 2)

  // Find the client
  const clientInstance = clients.find((c) => c.name === serverName)
  if (!clientInstance) {
    throw new Error(`MCP server not found: ${serverName}`)
  }

  // Execute based on client type
  if (clientInstance.isStdio) {
    // Use @modelcontextprotocol/sdk client
    const sdkClient = clientInstance.client as Client
    const result = await sdkClient.callTool({ name: toolName, arguments: args })

    // Extract text content from result
    if (result.content && Array.isArray(result.content)) {
      const textContent = result.content
        .filter((c) => c.type === 'text')
        .map((c) => (c as { type: 'text'; text: string }).text)
        .join('\n')
      return textContent || JSON.stringify(result.content)
    }
    return JSON.stringify(result)
  } else {
    // Use @ai-sdk/mcp client
    const aiSdkClient = clientInstance.client as Awaited<
      ReturnType<typeof createMCPClient>
    >
    const tools = await aiSdkClient.tools()
    const toolDef = tools[toolName]

    if (!toolDef || typeof toolDef.execute !== 'function') {
      throw new Error(`Tool not found or not executable: ${toolName}`)
    }

    return toolDef.execute(args, { toolCallId: '', messages: [] })
  }
}

/**
 * Close all MCP clients
 */
export async function closeMCPClients(
  clients: MCPClientInstance[]
): Promise<void> {
  for (const { name, client, isStdio } of clients) {
    try {
      if (isStdio) {
        await (client as Client).close()
      } else {
        await (
          client as Awaited<ReturnType<typeof createMCPClient>>
        ).close()
      }
      console.log(`[MCP] Closed connection to: ${name}`)
    } catch (error) {
      console.error(`[MCP] Error closing client ${name}:`, error)
    }
  }
}
