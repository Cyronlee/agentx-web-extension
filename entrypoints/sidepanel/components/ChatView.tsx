import { Spinner } from '@/components/ui/spinner'
import { useChatPersistence } from '@/hooks/use-chat-persistence'
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import { isToolUIPart } from 'ai'
import { useCallback, useState } from 'react'

import { ChatInput } from './ChatInput'
import { ConversationView } from './ConversationView'
import { APPROVAL } from './ToolConfirmation'

interface ChatViewProps {
  conversationId: string
  onConversationUpdate?: () => void
}

/**
 * ChatView - Main chat interface container
 *
 * Single responsibility: Orchestrate chat functionality
 * - Manages chat persistence and API communication
 * - Coordinates between ConversationView and ChatInput
 * - Handles tool confirmations
 *
 * State:
 * - Chat state from useChatPersistence hook
 * - Screenshot capture state (local)
 */
export function ChatView({
  conversationId,
  onConversationUpdate,
}: ChatViewProps) {
  const [isCapturing, setIsCapturing] = useState(false)

  const {
    messages,
    sendMessage,
    addToolOutput,
    status,
    stop,
    isLoading: isInitializing,
    error,
    conversation,
  } = useChatPersistence({ conversationId, onConversationUpdate })

  // Screenshot capture function
  const captureScreenshot = useCallback(async (): Promise<string | null> => {
    try {
      setIsCapturing(true)
      const currentWindow = await browser.windows.getCurrent()
      if (!currentWindow?.id) {
        console.error('No current window found')
        return null
      }

      const dataUrl = await browser.tabs.captureVisibleTab(currentWindow.id, {
        format: 'png',
      })
      return dataUrl
    } catch (error) {
      console.error('Failed to capture screenshot:', error)
      return null
    } finally {
      setIsCapturing(false)
    }
  }, [])

  // Check if there's a pending tool confirmation
  const hasPendingToolConfirmation = messages.some((m) =>
    m.parts?.some(
      (part) => isToolUIPart(part) && part.state === 'input-available'
    )
  )

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

  // Error state
  if (error && !conversation) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-4 bg-secondary p-4">
        <p className="text-destructive">Failed to load conversation</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  const isStreaming = status === 'streaming'

  return (
    <div className="relative flex size-full flex-col divide-y overflow-hidden bg-secondary">
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
      />
    </div>
  )
}
