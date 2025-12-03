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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import { useChatPersistence } from '@/hooks/use-chat-persistence'
import { cn } from '@/lib/utils'
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
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

const models = [
  {
    id: 'grok-3',
    name: 'Grok-3',
    chef: 'xAI',
    chefSlug: 'xai',
    providers: ['xai'],
  },
  {
    id: 'grok-2-1212',
    name: 'Grok-2-1212',
    chef: 'xAI',
    chefSlug: 'xai',
    providers: ['xai'],
  },
]

export function ChatView() {
  const [model, setModel] = useState<string>(models[0].id)
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)
  const [text, setText] = useState<string>('')
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false)

  const {
    messages,
    sendMessage,
    status,
    stop,
    isLoading: isInitializing,
    error,
    conversation,
  } = useChatPersistence()

  const selectedModelData = models.find((m) => m.id === model)

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text)
    const hasAttachments = Boolean(message.files?.length)

    if (!(hasText || hasAttachments)) {
      return
    }

    sendMessage({ text: message.text || '' })
    setText('')
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
                        .map((part) => {
                          if (part.type === 'source-url') {
                            return (
                              <Source
                                href={part.url}
                                key={part.id}
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
            placeholder="How can I help you?"
            value={text}
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
                    <ModelSelectorGroup heading="xAI">
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
                  disabled={!text.trim()}
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
