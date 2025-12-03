import {
  type UIMessage,
  type UIMessageStreamWriter,
  isToolUIPart,
  getToolName,
} from 'ai'
import { APPROVAL } from '../types.js'
import {
  type MCPClientInstance,
  executeMCPTool,
} from '../mcp/client.js'

/**
 * Process tool calls that require human confirmation
 * Checks for confirmation in the last message and executes approved tools
 */
export async function processToolCalls({
  messages,
  writer,
  mcpClients,
}: {
  messages: UIMessage[]
  writer: UIMessageStreamWriter
  mcpClients: MCPClientInstance[]
}): Promise<UIMessage[]> {
  const lastMessage = messages[messages.length - 1]
  const parts = lastMessage?.parts
  if (!parts) return messages

  const processedParts = await Promise.all(
    parts.map(async (part) => {
      // Only process tool UI parts
      if (!isToolUIPart(part)) return part

      const toolName = getToolName(part)

      // Only process if in 'output-available' state (user has responded)
      if (part.state !== 'output-available') return part

      let result: unknown

      if (part.output === APPROVAL.YES) {
        // User approved - execute the tool
        try {
          result = await executeMCPTool(
            mcpClients,
            toolName,
            part.input as Record<string, unknown>
          )
        } catch (error) {
          result = `Error executing tool: ${error instanceof Error ? error.message : String(error)}`
        }
      } else if (part.output === APPROVAL.NO) {
        // User denied
        result = 'Error: User denied access to tool execution'
      } else {
        // Unhandled response
        return part
      }

      // Forward updated tool result to the client
      writer.write({
        type: 'tool-output-available',
        toolCallId: part.toolCallId,
        output: result,
      })

      // Return updated part with actual result
      return {
        ...part,
        output: result,
      }
    })
  )

  // Return processed messages
  return [...messages.slice(0, -1), { ...lastMessage, parts: processedParts }]
}

/**
 * Get list of all tool names (all tools require confirmation in HITL mode)
 */
export function getAllToolNames(mcpClients: MCPClientInstance[]): string[] {
  const toolNames: string[] = []

  for (const { name, tools } of mcpClients) {
    for (const toolName of Object.keys(tools)) {
      toolNames.push(`${name}__${toolName}`)
    }
  }

  return toolNames
}

