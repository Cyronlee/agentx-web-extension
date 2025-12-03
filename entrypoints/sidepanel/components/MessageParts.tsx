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
import { MessageContent, MessageResponse } from '@/components/ai-elements/message'
import { cn } from '@/lib/utils'
import { isToolUIPart, getToolName, type UIMessage } from 'ai'
import { FileIcon } from 'lucide-react'
import {
  ToolConfirmation,
  ToolResult,
  ToolRunning,
} from './ToolConfirmation'

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

  // Tool waiting for confirmation
  if (part.state === 'input-available') {
    return (
      <ToolConfirmation
        toolCallId={toolCallId}
        toolName={toolName}
        input={part.input}
        onConfirm={(approved) => onConfirm(toolCallId, toolName, approved)}
      />
    )
  }

  // Tool completed (has output)
  if (part.state === 'output-available') {
    const isError =
      typeof part.output === 'string' && part.output.startsWith('Error')
    return (
      <ToolResult
        toolName={toolName}
        output={part.output}
        isError={isError}
      />
    )
  }

  // Tool in progress
  return <ToolRunning toolName={toolName} />
}

interface FilePartDisplayProps {
  parts: MessagePart[]
  messageId: string
}

export function FilePartDisplay({ parts, messageId }: FilePartDisplayProps) {
  const fileParts = parts.filter((p) => p.type === 'file')
  if (fileParts.length === 0) return null

  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {fileParts.map((part, index) => {
        if (part.type !== 'file') return null
        const isImage = part.mediaType?.startsWith('image/')
        return (
          <div
            key={`file-${messageId}-${index}`}
            className="overflow-hidden rounded-lg border bg-muted/50"
          >
            {isImage && part.url ? (
              <img
                src={part.url}
                alt={part.filename || 'Attached image'}
                className="max-h-[200px] max-w-[200px] object-cover"
              />
            ) : (
              <div className="flex items-center gap-2 px-3 py-2">
                <FileIcon className="h-4 w-4 text-muted-foreground" />
                <span className="max-w-[150px] truncate text-sm">
                  {part.filename || 'Attachment'}
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

interface TextPartProps {
  parts: MessagePart[]
  isUser: boolean
}

export function TextPart({ parts, isUser }: TextPartProps) {
  const textContent = parts
    .filter((p) => p.type === 'text')
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('')

  if (!textContent) return null

  return (
    <MessageContent
      className={cn(
        isUser &&
          'rounded-[24px] rounded-br-sm border bg-background text-foreground',
        !isUser && 'bg-transparent p-0 text-foreground'
      )}
    >
      <MessageResponse>{textContent}</MessageResponse>
    </MessageContent>
  )
}

interface MessagePartsRendererProps {
  message: UIMessage
  isLastMessage: boolean
  isStreaming: boolean
  onToolConfirm: (toolCallId: string, toolName: string, approved: boolean) => void
}

export function MessagePartsRenderer({
  message,
  isLastMessage,
  isStreaming,
  onToolConfirm,
}: MessagePartsRendererProps) {
  const isUser = message.role === 'user'

  return (
    <div>
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

      {/* File attachments */}
      <FilePartDisplay parts={message.parts} messageId={message.id} />

      {/* Text content */}
      <TextPart parts={message.parts} isUser={isUser} />
    </div>
  )
}

