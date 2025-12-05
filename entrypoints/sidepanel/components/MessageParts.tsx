import {
  MessageAttachment,
  MessageAttachments,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning'
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources'
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { isToolUIPart, getToolName, type UIMessage } from 'ai'
import { CheckCircle, XCircle } from 'lucide-react'

type MessagePart = UIMessage['parts'][number]

interface SourcesPartProps {
  parts: MessagePart[]
}

export function SourcesPart({ parts }: SourcesPartProps) {
  const sourceParts = parts.filter((p) => p.type === 'source-url')
  if (sourceParts.length === 0) return null

  return (
    <Sources>
      <SourcesTrigger count={sourceParts.length} />
      <SourcesContent>
        {sourceParts.map((part, index) => {
          if (part.type !== 'source-url') return null
          return (
            <Source
              href={part.url}
              key={`${part.url}-${index}`}
              title={part.title || new URL(part.url).hostname}
            />
          )
        })}
      </SourcesContent>
    </Sources>
  )
}

interface ReasoningPartProps {
  part: Extract<MessagePart, { type: 'reasoning' }>
  isStreaming: boolean
}

export function ReasoningPart({ part, isStreaming }: ReasoningPartProps) {
  return (
    <Reasoning isStreaming={isStreaming}>
      <ReasoningTrigger />
      <ReasoningContent>{part.text}</ReasoningContent>
    </Reasoning>
  )
}

interface ToolPartProps {
  part: MessagePart
  onConfirm: (toolCallId: string, toolName: string, approved: boolean) => void
}

export function ToolPart({ part, onConfirm }: ToolPartProps) {
  if (!isToolUIPart(part)) return null

  const toolName = getToolName(part)
  const toolCallId = part.toolCallId

  // Determine if tool should be open by default
  const shouldOpenByDefault =
    part.state === 'input-available' ||
    part.state === 'output-available' ||
    part.state === 'output-error'

  return (
    <Tool defaultOpen={shouldOpenByDefault}>
      <ToolHeader type={part.type} state={part.state} />
      <ToolContent>
        <ToolInput input={part.input} />

        {/* Confirmation buttons for HITL */}
        {part.state === 'input-available' && (
          <div className="flex gap-2 border-t p-4">
            <Button
              size="sm"
              variant="default"
              onClick={() => onConfirm(toolCallId, toolName, true)}
              className="flex-1"
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onConfirm(toolCallId, toolName, false)}
              className="flex-1"
            >
              <XCircle className="mr-1 h-4 w-4" />
              Deny
            </Button>
          </div>
        )}

        {/* Output section */}
        {(part.state === 'output-available' ||
          part.state === 'output-error') && (
          <ToolOutput output={part.output} errorText={part.errorText} />
        )}
      </ToolContent>
    </Tool>
  )
}

interface UserMessageContentProps {
  message: UIMessage
}

/**
 * Renders user message content with text and file attachments
 * Following the reference UI pattern: attachments displayed above text
 */
export function UserMessageContent({ message }: UserMessageContentProps) {
  const textContent = message.parts
    .filter((p) => p.type === 'text')
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('')

  const fileParts = message.parts.filter((p) => p.type === 'file')
  const hasFiles = fileParts.length > 0
  const hasText = Boolean(textContent)

  if (!hasFiles && !hasText) return null

  return (
    <div className="flex flex-col items-end gap-2">
      {/* File attachments - displayed as thumbnails above text */}
      {hasFiles && (
        <MessageAttachments>
          {fileParts.map((part, index) => {
            if (part.type !== 'file') return null
            return (
              <MessageAttachment
                key={`file-${message.id}-${index}`}
                data={{
                  type: 'file',
                  url: part.url,
                  mediaType: part.mediaType || 'application/octet-stream',
                  filename: part.filename,
                }}
              />
            )
          })}
        </MessageAttachments>
      )}

      {/* Text content - styled as user message bubble */}
      {hasText && (
        <MessageContent className="group-[.is-user]:rounded-[24px] group-[.is-user]:rounded-br-sm group-[.is-user]:border group-[.is-user]:bg-background group-[.is-user]:text-foreground">
          <MessageResponse>{textContent}</MessageResponse>
        </MessageContent>
      )}
    </div>
  )
}

interface AssistantMessageContentProps {
  message: UIMessage
  isLastMessage: boolean
  isStreaming: boolean
  onToolConfirm: (
    toolCallId: string,
    toolName: string,
    approved: boolean
  ) => void
}

/**
 * Renders assistant message content with sources, reasoning, tools, and text
 */
export function AssistantMessageContent({
  message,
  isLastMessage,
  isStreaming,
  onToolConfirm,
}: AssistantMessageContentProps) {
  const textContent = message.parts
    .filter((p) => p.type === 'text')
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('')

  return (
    <div className="flex flex-col gap-2">
      {/* Sources */}
      <SourcesPart parts={message.parts} />

      {/* Reasoning parts */}
      {message.parts.map((part, partIndex) => {
        if (part.type !== 'reasoning') return null
        const isLastPart = partIndex === message.parts.length - 1
        const isStreamingReasoning = isStreaming && isLastPart && isLastMessage

        return (
          <ReasoningPart
            key={`reasoning-${message.id}-${partIndex}`}
            part={part}
            isStreaming={isStreamingReasoning}
          />
        )
      })}

      {/* Tool invocations */}
      {message.parts
        .filter((p) => isToolUIPart(p))
        .map((part) => (
          <ToolPart
            key={isToolUIPart(part) ? part.toolCallId : undefined}
            part={part}
            onConfirm={onToolConfirm}
          />
        ))}

      {/* Text content - assistant style (no bubble) */}
      {textContent && (
        <MessageContent className="group-[.is-assistant]:bg-transparent group-[.is-assistant]:p-0 group-[.is-assistant]:text-foreground">
          <MessageResponse>{textContent}</MessageResponse>
        </MessageContent>
      )}
    </div>
  )
}

interface MessagePartsRendererProps {
  message: UIMessage
  isLastMessage: boolean
  isStreaming: boolean
  onToolConfirm: (
    toolCallId: string,
    toolName: string,
    approved: boolean
  ) => void
}

export function MessagePartsRenderer({
  message,
  isLastMessage,
  isStreaming,
  onToolConfirm,
}: MessagePartsRendererProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return <UserMessageContent message={message} />
  }

  return (
    <AssistantMessageContent
      message={message}
      isLastMessage={isLastMessage}
      isStreaming={isStreaming}
      onToolConfirm={onToolConfirm}
    />
  )
}
