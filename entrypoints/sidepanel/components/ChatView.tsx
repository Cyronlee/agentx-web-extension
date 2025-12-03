import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { Message } from '@/components/ai-elements/message'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import { useChatPersistence } from '@/hooks/use-chat-persistence'
import { useFileUpload, type FilePart } from '@/hooks/use-file-upload'
import { cn } from '@/lib/utils'
import { isToolUIPart } from 'ai'
import {
  ArrowUpIcon,
  CheckIcon,
  FileIcon,
  ImageIcon,
  PaperclipIcon,
  SquareIcon,
  XIcon,
} from 'lucide-react'
import { useState } from 'react'
import { models, DEFAULT_MODEL_ID } from '../lib/models'
import { MessagePartsRenderer } from './MessageParts'
import { APPROVAL } from './ToolConfirmation'

interface ChatViewProps {
  conversationId: string
  onConversationUpdate?: () => void
}

export function ChatView({
  conversationId,
  onConversationUpdate,
}: ChatViewProps) {
  const [model, setModel] = useState<string>(DEFAULT_MODEL_ID)
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)
  const [text, setText] = useState<string>('')

  const {
    files,
    fileInputRef,
    openFileDialog,
    handleFileChange,
    removeFile,
    clearFiles,
    getFileParts,
    hasFiles,
    fileCount,
  } = useFileUpload()

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

  const handleSubmit = async (message: PromptInputMessage) => {
    const hasText = Boolean(message.text)
    if (!(hasText || hasFiles)) return

    // Convert files to data URLs if any
    const fileParts = hasFiles ? await getFileParts() : []

    // Build message parts
    const parts: Array<{ type: 'text'; text: string } | FilePart> = []
    if (message.text) {
      parts.push({ type: 'text', text: message.text })
    }
    parts.push(...fileParts)

    sendMessage({ parts })

    // Clear inputs
    setText('')
    clearFiles()
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

  const isStreaming = status === 'streaming'

  return (
    <div className="relative flex size-full flex-col divide-y overflow-hidden bg-secondary">
      <Conversation>
        <ConversationContent>
          {messages.map((message, index) => (
            <Message
              from={message.role as 'user' | 'assistant'}
              key={message.id}
            >
              <MessagePartsRenderer
                message={message}
                isLastMessage={index === messages.length - 1}
                isStreaming={isStreaming}
                onToolConfirm={handleToolConfirmation}
              />
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="grid shrink-0 gap-4 p-4">
        <PromptInput
          className="divide-y-0 rounded-[28px]"
          onSubmit={handleSubmit}
        >
          {/* File preview section */}
          {hasFiles && (
            <div className="flex flex-wrap gap-2 px-4 pt-3">
              {Array.from(files!).map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm"
                >
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-1 rounded-full p-0.5 hover:bg-background"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

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
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <PromptInputButton
                    className={cn(
                      '!rounded-full border text-foreground',
                      hasFiles && 'bg-primary text-primary-foreground'
                    )}
                    variant="outline"
                  >
                    <PaperclipIcon size={16} />
                    {hasFiles && <span className="text-xs">{fileCount}</span>}
                    <span className="sr-only">Attach</span>
                  </PromptInputButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => openFileDialog()}>
                    <FileIcon className="mr-2" size={16} />
                    Upload file
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openFileDialog('image/*')}>
                    <ImageIcon className="mr-2" size={16} />
                    Upload image
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => openFileDialog('application/pdf')}
                  >
                    <FileIcon className="mr-2" size={16} />
                    Upload PDF
                  </DropdownMenuItem>
                  {hasFiles && (
                    <DropdownMenuItem
                      onClick={clearFiles}
                      className="text-destructive"
                    >
                      <XIcon className="mr-2" size={16} />
                      Clear attachments
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
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
                  disabled={
                    (!text.trim() && !hasFiles) || hasPendingToolConfirmation
                  }
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
