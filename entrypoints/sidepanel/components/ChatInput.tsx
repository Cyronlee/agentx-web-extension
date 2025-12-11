import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from '@/components/ai-elements/prompt-input'
import type { Agent } from '@/db'
import type { ChatStatus } from 'ai'
import { ArrowUpIcon, SquareIcon } from 'lucide-react'
import { useState, useCallback } from 'react'

import { DEFAULT_MODEL_ID } from '../lib/models'
import { AttachmentMenu } from './AttachmentMenu'
import { MagicTemplateButton } from './magic-template'
import { MCPIndicator } from './mcp/MCPIndicator'
import { MCPDialog } from './mcp/MCPDialog'
import { ModelSelectorButton } from './ModelSelectorButton'
import { useMCPStatus } from '@/hooks/use-mcp-status'
import { parseAgentMCPConfig } from '@/db'
import type { ParsedMCPConfig } from '@/types/mcp'
import { useMemo } from 'react'

// SubmitButton component that can access attachments context
interface SubmitButtonProps {
  text: string
  disabled: boolean
}

function SubmitButton({ text, disabled }: SubmitButtonProps) {
  const attachments = usePromptInputAttachments()
  const hasContent = text.trim() || attachments.files.length > 0

  return (
    <PromptInputButton
      className="rounded-full bg-foreground font-medium text-background"
      type="submit"
      variant="default"
      disabled={!hasContent || disabled}
    >
      <ArrowUpIcon size={16} />
      <span className="sr-only">Send</span>
    </PromptInputButton>
  )
}

interface ChatInputProps {
  onSubmit: (message: PromptInputMessage) => void
  onStop: () => void
  status: ChatStatus
  disabled?: boolean
  placeholder?: string
  onCaptureScreenshot: () => Promise<string | null>
  isCapturing: boolean
  agent?: Agent | null
  onAgentUpdate?: () => void
  onNavigateToTemplates?: () => void
}

/**
 * ChatInput - The input area for composing and sending messages
 *
 * Single responsibility: Handle message composition, attachments, and submission
 * State: Local state for text input and model selection
 */
export function ChatInput({
  onSubmit,
  onStop,
  status,
  disabled = false,
  placeholder = 'How can I help you?',
  onCaptureScreenshot,
  isCapturing,
  agent,
  onAgentUpdate,
  onNavigateToTemplates,
}: ChatInputProps) {
  const [text, setText] = useState('')
  const [model, setModel] = useState(DEFAULT_MODEL_ID)
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)
  const [mcpDialogOpen, setMcpDialogOpen] = useState(false)

  const isStreaming = status === 'streaming'
  const isSubmitted = status === 'submitted'
  const isProcessing = isStreaming || isSubmitted

  // Parse MCP config for SWR
  const mcpConfig = useMemo(() => {
    if (!agent) return null
    return parseAgentMCPConfig(agent) as ParsedMCPConfig | null
  }, [agent])

  const hasServers = useMemo(() => {
    if (!mcpConfig?.mcpServers) return false
    return Object.keys(mcpConfig.mcpServers).length > 0
  }, [mcpConfig])

  // Preload MCP status using SWR
  const { serverStatus, isLoading: isMCPLoading } = useMCPStatus({
    mcpConfig,
    enabled: (agent?.mcpServersEnabled ?? false) && hasServers,
  })

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const hasText = Boolean(message.text)
      const hasFiles = Boolean(message.files?.length)
      if (!(hasText || hasFiles)) return

      onSubmit(message)
      setText('')
    },
    [onSubmit]
  )

  const handleInsertTemplate = useCallback((content: string) => {
    // Insert template content into the text area
    setText((prevText) => {
      if (prevText) {
        return prevText + '\n\n' + content
      }
      return content
    })
  }, [])

  return (
    <div className="grid shrink-0 gap-4 p-4">
      <PromptInput
        className="divide-y-0 rounded-[28px]"
        onSubmit={handleSubmit}
        multiple
      >
        <PromptInputHeader>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
        </PromptInputHeader>

        <PromptInputTextarea
          className="px-5 md:text-base"
          onChange={(event) => setText(event.target.value)}
          placeholder={
            disabled
              ? 'Please approve or deny the tool request above...'
              : placeholder
          }
          value={text}
          disabled={disabled}
        />

        <PromptInputFooter className="p-2.5">
          <PromptInputTools>
            <AttachmentMenu
              onCaptureScreenshot={onCaptureScreenshot}
              isCapturing={isCapturing}
            />
            <MagicTemplateButton
              onInsertTemplate={handleInsertTemplate}
              onManageTemplates={onNavigateToTemplates}
            />
            <MCPIndicator
              agent={agent ?? null}
              toolsCount={serverStatus?.totalToolsCount}
              isLoading={isMCPLoading}
              onClick={() => setMcpDialogOpen(true)}
            />
          </PromptInputTools>

          <div className="flex items-center gap-2">
            <ModelSelectorButton
              selectedModelId={model}
              onModelChange={setModel}
              open={modelSelectorOpen}
              onOpenChange={setModelSelectorOpen}
            />

            {isProcessing ? (
              <PromptInputButton
                className="rounded-full bg-foreground font-medium text-background"
                onClick={onStop}
                type="button"
                variant="default"
              >
                <SquareIcon size={16} className="fill-current" />
                <span className="sr-only">Stop</span>
              </PromptInputButton>
            ) : (
              <SubmitButton text={text} disabled={disabled} />
            )}
          </div>
        </PromptInputFooter>
      </PromptInput>

      <MCPDialog
        agent={agent ?? null}
        open={mcpDialogOpen}
        onOpenChange={setMcpDialogOpen}
        onAgentUpdate={onAgentUpdate}
      />
    </div>
  )
}
