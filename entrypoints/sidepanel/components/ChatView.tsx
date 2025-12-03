import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from '@/components/ai-elements/model-selector'
import {
  PromptInput,
  PromptInputButton,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input'
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
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import { useChatPersistence } from '@/hooks/use-chat-persistence'
import { cn } from '@/lib/utils'
import { isToolUIPart, getToolName } from 'ai'
import {
  ArrowUpIcon,
  CameraIcon,
  CheckIcon,
  ChevronDownIcon,
  FileIcon,
  ImageIcon,
  LightbulbIcon,
  PaperclipIcon,
  ScreenShareIcon,
  SearchIcon,
  SquareIcon,
  Wrench,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

// Human-in-the-loop approval states (must match backend)
const APPROVAL = {
  YES: 'Yes, confirmed.',
  NO: 'No, denied.',
} as const

const models = [
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    chef: 'OpenAI',
    chefSlug: 'openai',
    providers: ['openai'],
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    chef: 'OpenAI',
    chefSlug: 'openai',
    providers: ['openai'],
  },
  {
    id: 'anthropic/claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    chef: 'Anthropic',
    chefSlug: 'anthropic',
    providers: ['anthropic'],
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.0 Flash',
    chef: 'Google',
    chefSlug: 'google',
    providers: ['google'],
  },
]

interface ChatViewProps {
  conversationId: string
  onConversationUpdate?: () => void
}

export function ChatView({
  conversationId,
  onConversationUpdate,
}: ChatViewProps) {
  const [model, setModel] = useState<string>(models[0].id)
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)
  const [text, setText] = useState<string>('')
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false)

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

  const selectedModelData = models.find((m) => m.id === model)

  // Check if there's a pending tool confirmation
  const hasPendingToolConfirmation = messages.some((m) =>
    m.parts?.some(
      (part) => isToolUIPart(part) && part.state === 'input-available'
    )
  )

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text)
    const hasAttachments = Boolean(message.files?.length)

    if (!(hasText || hasAttachments)) {
      return
    }

    sendMessage({ text: message.text || '' })
    setText('')
  }

  const handleToolConfirmation = async (
    toolCallId: string,
    toolName: string,
    approved: boolean
  ) => {
    await addToolOutput({
      toolCallId,
      tool: toolName,
      output: approved ? APPROVAL.YES : APPROVAL.NO,
    })
    sendMessage() // Continue the conversation after tool confirmation
  }

  const handleFileAction = (action: string) => {
    toast.success('File action', {
      description: action,
    })
  }

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="flex size-full items-center justify-center bg-secondary">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  // Show error state
  if (error && !conversation) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-4 bg-secondary p-4">
        <p className="text-destructive">Failed to load conversation</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="relative flex size-full flex-col divide-y overflow-hidden bg-secondary">
      <Conversation>
        <ConversationContent>
          {messages.map((message) => (
            <Message
              from={message.role as 'user' | 'assistant'}
              key={message.id}
            >
              <div>
                {/* Render sources if available */}
                {message.parts.some((p) => p.type === 'source-url') && (
                  <Sources>
                    <SourcesTrigger
                      count={
                        message.parts.filter((p) => p.type === 'source-url')
                          .length
                      }
                    />
                    <SourcesContent>
                      {message.parts
                        .filter((p) => p.type === 'source-url')
                        .map((part, index) => {
                          if (part.type === 'source-url') {
                            return (
                              <Source
                                href={part.url}
                                key={`${part.url}-${index}`}
                                title={part.title || new URL(part.url).hostname}
                              />
                            )
                          }
                          return null
                        })}
                    </SourcesContent>
                  </Sources>
                )}

                {/* Render reasoning if available */}
                {message.parts.some((p) => p.type === 'reasoning') && (
                  <Reasoning duration={0} isStreaming={status === 'streaming'}>
                    <ReasoningTrigger />
                    <ReasoningContent>
                      {message.parts
                        .filter((p) => p.type === 'reasoning')
                        .map((part) => {
                          if (part.type === 'reasoning') {
                            return part.text
                          }
                          return ''
                        })
                        .join('')}
                    </ReasoningContent>
                  </Reasoning>
                )}

                {/* Render tool invocations with confirmation UI */}
                {message.parts
                  .filter((p) => isToolUIPart(p))
                  .map((part) => {
                    if (!isToolUIPart(part)) return null
                    const toolName = getToolName(part)
                    const toolCallId = part.toolCallId

                    // Tool waiting for confirmation
                    if (part.state === 'input-available') {
                      return (
                        <div
                          key={toolCallId}
                          className="my-2 rounded-lg border bg-background p-3"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Wrench className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              Tool Request
                            </span>
                          </div>
                          <div className="text-sm mb-2">
                            <span className="text-muted-foreground">
                              Execute{' '}
                            </span>
                            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                              {toolName}
                            </code>
                          </div>
                          <div className="text-xs text-muted-foreground bg-muted rounded p-2 mb-3 font-mono overflow-auto max-h-32">
                            {JSON.stringify(part.input, null, 2)}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() =>
                                handleToolConfirmation(
                                  toolCallId,
                                  toolName,
                                  true
                                )
                              }
                              className="flex-1"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleToolConfirmation(
                                  toolCallId,
                                  toolName,
                                  false
                                )
                              }
                              className="flex-1"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Deny
                            </Button>
                          </div>
                        </div>
                      )
                    }

                    // Tool completed (has output)
                    if (part.state === 'output-available') {
                      const isError =
                        typeof part.output === 'string' &&
                        part.output.startsWith('Error')
                      return (
                        <div
                          key={toolCallId}
                          className={cn(
                            'my-2 rounded-lg border p-3',
                            isError
                              ? 'border-destructive/50 bg-destructive/10'
                              : 'border-green-500/50 bg-green-500/10'
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {isError ? (
                              <XCircle className="h-4 w-4 text-destructive" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            <code className="text-xs font-mono">
                              {toolName}
                            </code>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono overflow-auto max-h-24">
                            {typeof part.output === 'string'
                              ? part.output
                              : JSON.stringify(part.output, null, 2)}
                          </div>
                        </div>
                      )
                    }

                    // Tool in progress
                    return (
                      <div
                        key={toolCallId}
                        className="my-2 rounded-lg border bg-background p-3"
                      >
                        <div className="flex items-center gap-2">
                          <Spinner className="h-4 w-4" />
                          <code className="text-xs font-mono">{toolName}</code>
                          <span className="text-xs text-muted-foreground">
                            Running...
                          </span>
                        </div>
                      </div>
                    )
                  })}

                {/* Render text content */}
                <MessageContent
                  className={cn(
                    'group-[.is-user]:rounded-[24px] group-[.is-user]:rounded-br-sm group-[.is-user]:border group-[.is-user]:bg-background group-[.is-user]:text-foreground',
                    'group-[.is-assistant]:bg-transparent group-[.is-assistant]:p-0 group-[.is-assistant]:text-foreground'
                  )}
                >
                  <MessageResponse>
                    {message.parts
                      .filter((p) => p.type === 'text')
                      .map((part) => {
                        if (part.type === 'text') {
                          return part.text
                        }
                        return ''
                      })
                      .join('')}
                  </MessageResponse>
                </MessageContent>
              </div>
            </Message>
          ))}

          {/* Show loading indicator when waiting for response */}
          {status === 'submitted' && (
            <Message from="assistant">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Spinner className="h-4 w-4" />
                <span className="text-sm">Thinking...</span>
              </div>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="grid shrink-0 gap-4 p-4">
        <PromptInput
          className="divide-y-0 rounded-[28px]"
          onSubmit={handleSubmit}
        >
          <PromptInputTextarea
            className="px-5 md:text-base"
            onChange={(event) => setText(event.target.value)}
            placeholder={
              hasPendingToolConfirmation
                ? 'Please approve or deny the tool request above...'
                : 'How can I help you?'
            }
            value={text}
            disabled={hasPendingToolConfirmation}
          />
          <PromptInputFooter className="p-2.5">
            <PromptInputTools>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <PromptInputButton
                    className="!rounded-full border text-foreground"
                    variant="outline"
                  >
                    <PaperclipIcon size={16} />
                    <span className="sr-only">Attach</span>
                  </PromptInputButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    onClick={() => handleFileAction('upload-file')}
                  >
                    <FileIcon className="mr-2" size={16} />
                    Upload file
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFileAction('upload-photo')}
                  >
                    <ImageIcon className="mr-2" size={16} />
                    Upload photo
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFileAction('take-screenshot')}
                  >
                    <ScreenShareIcon className="mr-2" size={16} />
                    Take screenshot
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFileAction('take-photo')}
                  >
                    <CameraIcon className="mr-2" size={16} />
                    Take photo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex items-center rounded-full border">
                <PromptInputButton
                  className="!rounded-l-full text-foreground"
                  onClick={() => setUseWebSearch(!useWebSearch)}
                  variant="ghost"
                >
                  <SearchIcon size={16} />
                  <span>DeepSearch</span>
                </PromptInputButton>
                <div className="h-full w-px bg-border" />
                <PromptInputButton
                  className="rounded-r-full"
                  size="icon-sm"
                  variant="ghost"
                >
                  <ChevronDownIcon size={16} />
                </PromptInputButton>
              </div>
              <PromptInputButton
                className="!rounded-full text-foreground"
                variant="outline"
              >
                <LightbulbIcon size={16} />
                <span>Think</span>
              </PromptInputButton>
            </PromptInputTools>
            <div className="flex items-center gap-2">
              <ModelSelector
                onOpenChange={setModelSelectorOpen}
                open={modelSelectorOpen}
              >
                <ModelSelectorTrigger asChild>
                  <PromptInputButton>
                    {selectedModelData?.chefSlug && (
                      <ModelSelectorLogo
                        provider={selectedModelData.chefSlug}
                      />
                    )}
                    {selectedModelData?.name && (
                      <ModelSelectorName>
                        {selectedModelData.name}
                      </ModelSelectorName>
                    )}
                  </PromptInputButton>
                </ModelSelectorTrigger>
                <ModelSelectorContent>
                  <ModelSelectorInput placeholder="Search models..." />
                  <ModelSelectorList>
                    <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                    <ModelSelectorGroup heading="Models">
                      {models.map((m) => (
                        <ModelSelectorItem
                          key={m.id}
                          onSelect={() => {
                            setModel(m.id)
                            setModelSelectorOpen(false)
                          }}
                          value={m.id}
                        >
                          <ModelSelectorLogo provider={m.chefSlug} />
                          <ModelSelectorName>{m.name}</ModelSelectorName>
                          <ModelSelectorLogoGroup>
                            {m.providers.map((provider) => (
                              <ModelSelectorLogo
                                key={provider}
                                provider={provider}
                              />
                            ))}
                          </ModelSelectorLogoGroup>
                          {model === m.id ? (
                            <CheckIcon className="ml-auto size-4" />
                          ) : (
                            <div className="ml-auto size-4" />
                          )}
                        </ModelSelectorItem>
                      ))}
                    </ModelSelectorGroup>
                  </ModelSelectorList>
                </ModelSelectorContent>
              </ModelSelector>
              {status === 'submitted' || status === 'streaming' ? (
                <PromptInputButton
                  className="rounded-full bg-foreground font-medium text-background"
                  onClick={() => stop()}
                  type="button"
                  variant="default"
                >
                  <SquareIcon size={16} className="fill-current" />
                  <span className="sr-only">Stop</span>
                </PromptInputButton>
              ) : (
                <PromptInputButton
                  className="rounded-full bg-foreground font-medium text-background"
                  type="submit"
                  variant="default"
                  disabled={!text.trim() || hasPendingToolConfirmation}
                >
                  <ArrowUpIcon size={16} />
                  <span className="sr-only">Send</span>
                </PromptInputButton>
              )}
            </div>
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  )
}
