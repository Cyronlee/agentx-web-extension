import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { Message } from '@/components/ai-elements/message'
import type { UIMessage } from 'ai'

import { MessagePartsRenderer } from './MessageParts'

interface ConversationViewProps {
  messages: UIMessage[]
  isStreaming: boolean
  onToolConfirm: (
    toolCallId: string,
    toolName: string,
    approved: boolean
  ) => void
}

/**
 * ConversationView - Displays the list of chat messages
 *
 * Single responsibility: Render messages in a scrollable conversation view
 * State: Receives messages from parent, no internal state
 */
export function ConversationView({
  messages,
  isStreaming,
  onToolConfirm,
}: ConversationViewProps) {
  return (
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
              onToolConfirm={onToolConfirm}
            />
          </Message>
        ))}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}

