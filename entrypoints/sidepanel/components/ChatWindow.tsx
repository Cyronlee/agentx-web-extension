import { Spinner } from '@/components/ui/spinner'
import { useChatPersistence } from '@/hooks/use-chat-persistence'
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import { isToolUIPart } from 'ai'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { ChatInput } from './ChatInput'
import { ConversationView } from './ConversationView'
import { APPROVAL } from './ToolConfirmation'

interface ChatViewProps {
  conversationId: string
  onConversationUpdate?: () => void
  onNavigate?: (page: 'magic-templates') => void
}

/**
 * ChatView - Main chat interface container
 *
 * Responsibilities:
 * - Orchestrates chat functionality via useChatPersistence hook
 * - Coordinates between ConversationView and ChatInput
 * - Handles tool confirmations and screenshot capture
 * - Displays error notifications via toast
 */
export function ChatView({
  conversationId,
  onConversationUpdate,
  onNavigate,
}: ChatViewProps) {
  const [isCapturing, setIsCapturing] = useState(false)

  // Initialize chat with error handler
  const {
    messages,
    sendMessage,
    addToolOutput,
    status,
    stop,
    isLoading: isInitializing,
    error,
    conversation,
    agent,
    refreshAgent,
  } = useChatPersistence({
    conversationId,
    onConversationUpdate,
    onError: (err) => {
      toast.error(err.message || 'An unexpected error occurred')
    },
  })

  // Screenshot capture handler
  const captureScreenshot = useCallback(async (): Promise<string | null> => {
    try {
      setIsCapturing(true)
      const currentWindow = await browser.windows.getCurrent()

      if (!currentWindow?.id) {
        toast.error('Screenshot Failed', {
          description: 'No active window found',
        })
        return null
      }

      const dataUrl = await browser.tabs.captureVisibleTab(currentWindow.id, {
        format: 'png',
      })
      return dataUrl
    } catch (error) {
      console.error('Failed to capture screenshot:', error)
      toast.error('Screenshot Failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
      return null
    } finally {
      setIsCapturing(false)
    }
  }, [])

  // Message submission handler
  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const hasText = Boolean(message.text)
      const hasFiles = Boolean(message.files?.length)

      if (!(hasText || hasFiles)) return

      // Build message parts from the PromptInput message
      const parts: Array<
        | { type: 'text'; text: string }
        | { type: 'file'; url: string; mediaType: string; filename?: string }
      > = []

      if (message.text) {
        parts.push({ type: 'text', text: message.text })
      }

      if (message.files) {
        for (const file of message.files) {
          parts.push({
            type: 'file',
            url: file.url,
            mediaType: file.mediaType || 'application/octet-stream',
            filename: file.filename,
          })
        }
      }

      sendMessage({ parts })
    },
    [sendMessage]
  )

  // Tool confirmation handler
  const handleToolConfirmation = useCallback(
    async (toolCallId: string, toolName: string, approved: boolean) => {
      await addToolOutput({
        toolCallId,
        tool: toolName,
        output: approved ? APPROVAL.YES : APPROVAL.NO,
      })
      sendMessage() // Continue the conversation after tool confirmation
    },
    [addToolOutput, sendMessage]
  )

  // Loading state
  if (isInitializing) {
    return (
      <div className="flex size-full items-center justify-center bg-secondary">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  // Error state - only show if conversation failed to load
  if (error && !conversation) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-4 bg-secondary p-4">
        <p className="text-destructive">Failed to load conversation</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  // Check if there's a pending tool confirmation
  const hasPendingToolConfirmation = messages.some((m) =>
    m.parts?.some(
      (part) => isToolUIPart(part) && part.state === 'input-available'
    )
  )

  const isStreaming = status === 'streaming'

  return (
    <div className="relative flex size-full flex-col overflow-hidden bg-secondary">
      <ConversationView
        messages={messages}
        isStreaming={isStreaming}
        onToolConfirm={handleToolConfirmation}
      />

      <ChatInput
        onSubmit={handleSubmit}
        onStop={stop}
        status={status}
        disabled={hasPendingToolConfirmation}
        onCaptureScreenshot={captureScreenshot}
        isCapturing={isCapturing}
        agent={agent}
        onAgentUpdate={refreshAgent}
        onNavigateToTemplates={() => onNavigate?.('magic-templates')}
      />
    </div>
  )
}
