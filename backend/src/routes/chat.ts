import {
  Router,
  type Request,
  type Response,
  type Router as RouterType,
} from 'express'
import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  pipeUIMessageStreamToResponse,
  stepCountIs,
} from 'ai'
import { google, type GoogleGenerativeAIProviderOptions } from '@ai-sdk/google'
import type { ChatRequestBody } from '../types.js'
import {
  createMCPClients,
  mergeTools,
  closeMCPClients,
  type MCPClientInstance,
} from '../mcp/client.js'
import { processToolCalls } from '../utils/hitl.js'

const router: RouterType = Router()

router.post('/', async (req: Request, res: Response) => {
  const requestId = `req_${Date.now()}_${Math.random()
    .toString(36)
    .substring(7)}`
  const startTime = Date.now()

  console.log(`[Chat][${requestId}] === New chat request ===`)

  const body = req.body as ChatRequestBody
  const { messages, mcpConfig, apiKeys, model, systemPrompt } = body

  // Determine which provider/model to use
  const selectedModel = model || 'google/gemini-2.5-flash-lite'

  console.log(`[Chat][${requestId}] Model: ${selectedModel}`)
  console.log(`[Chat][${requestId}] Messages count: ${messages?.length || 0}`)
  console.log(
    `[Chat][${requestId}] System prompt: ${
      systemPrompt ? `${systemPrompt.slice(0, 50)}...` : 'none'
    }`
  )
  console.log(
    `[Chat][${requestId}] API keys configured: ${
      Object.keys(apiKeys || {})
        .filter((k) => apiKeys?.[k as keyof typeof apiKeys])
        .join(', ') || 'none'
    }`
  )

  // Setup API keys from request or environment
  if (apiKeys?.aiGateway) {
    process.env.AI_GATEWAY_API_KEY = apiKeys.aiGateway
  }
  if (apiKeys?.google) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKeys.google
  }

  // Create MCP clients if config provided
  let mcpClients: MCPClientInstance[] = []

  const mcpServerNames = Object.keys(mcpConfig?.mcpServers || {})
  console.log(
    `[Chat][${requestId}] MCP servers configured: ${
      mcpServerNames.length > 0 ? mcpServerNames.join(', ') : 'none'
    }`
  )

  if (mcpConfig?.mcpServers && Object.keys(mcpConfig.mcpServers).length > 0) {
    try {
      console.log(`[Chat][${requestId}] Creating MCP clients...`)
      mcpClients = await createMCPClients(mcpConfig)
      console.log(
        `[Chat][${requestId}] MCP clients created successfully: ${mcpClients.length}`
      )
    } catch (error) {
      console.error(`[Chat][${requestId}] Failed to create MCP clients:`, error)
    }
  }

  // Merge all MCP tools
  const tools = mergeTools(mcpClients)
  const hasTools = Object.keys(tools).length > 0
  console.log(
    `[Chat][${requestId}] Available tools: ${
      hasTools ? Object.keys(tools).join(', ') : 'none'
    }`
  )

  try {
    console.log(`[Chat][${requestId}] Starting stream response...`)

    pipeUIMessageStreamToResponse({
      response: res,
      stream: createUIMessageStream({
        originalMessages: messages,
        execute: async ({ writer }) => {
          // Process any pending tool confirmations
          let processedMessages = messages
          if (hasTools && mcpClients.length > 0) {
            console.log(`[Chat][${requestId}] Processing tool calls...`)
            processedMessages = await processToolCalls({
              messages,
              writer,
              mcpClients,
            })
            console.log(`[Chat][${requestId}] Tool calls processed`)
          }

          // Determine the model provider
          let modelInstance: Parameters<typeof streamText>[0]['model']

          if (selectedModel.startsWith('google/')) {
            // Use Google AI
            const googleModel = selectedModel.replace('google/', '')
            modelInstance = google(googleModel)
            const hasThinking =
              googleModel.includes('2.5') || googleModel.includes('3')
            console.log(
              `[Chat][${requestId}] Using Google AI: ${googleModel} (thinking: ${
                hasThinking ? 'enabled' : 'disabled'
              })`
            )
          } else {
            // Use Vercel AI Gateway (default)
            // The AI SDK automatically uses AI_GATEWAY_API_KEY
            modelInstance = selectedModel as Parameters<
              typeof streamText
            >[0]['model']
            console.log(
              `[Chat][${requestId}] Using AI Gateway: ${selectedModel}`
            )
          }

          console.log(`[Chat][${requestId}] Calling streamText...`)

          // Check if Google model supports thinking (2.5+ models)
          const isGoogleModel = selectedModel.startsWith('google/')
          const googleModelName = isGoogleModel
            ? selectedModel.replace('google/', '')
            : ''
          const supportsThinking =
            isGoogleModel &&
            (googleModelName.includes('2.5') || googleModelName.includes('3'))

          const result = streamText({
            model: modelInstance,
            system: systemPrompt || undefined,
            messages: convertToModelMessages(processedMessages),
            tools: hasTools ? tools : undefined,
            stopWhen: hasTools ? stepCountIs(10) : undefined,
            // Enable thinking for supported Google models
            providerOptions: supportsThinking
              ? ({
                  google: {
                    thinkingConfig: {
                      thinkingBudget: 8192,
                      includeThoughts: true,
                    },
                  },
                } satisfies { google: GoogleGenerativeAIProviderOptions })
              : undefined,
            onFinish: async ({ usage, finishReason }) => {
              const duration = Date.now() - startTime
              console.log(`[Chat][${requestId}] Stream finished`)
              console.log(`[Chat][${requestId}] Finish reason: ${finishReason}`)
              console.log(
                `[Chat][${requestId}] Token usage: ${JSON.stringify(usage)}`
              )
              console.log(`[Chat][${requestId}] Total duration: ${duration}ms`)

              // Close MCP clients when done
              if (mcpClients.length > 0) {
                console.log(`[Chat][${requestId}] Closing MCP clients...`)
                await closeMCPClients(mcpClients)
                console.log(`[Chat][${requestId}] MCP clients closed`)
              }
            },
          })

          writer.merge(
            result.toUIMessageStream({ originalMessages: processedMessages })
          )
        },
      }),
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[Chat][${requestId}] Error after ${duration}ms:`, error)

    // Cleanup on error
    if (mcpClients.length > 0) {
      console.log(`[Chat][${requestId}] Cleaning up MCP clients after error...`)
      await closeMCPClients(mcpClients)
    }

    if (!res.headersSent) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error',
      })
    }
  }
})

export default router
