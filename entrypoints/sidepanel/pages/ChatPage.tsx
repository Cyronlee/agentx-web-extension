import { useEffect, useState, useCallback } from 'react'
import { ChatView } from '../components/ChatWindow'
import { DragDropOverlay } from '../components/DragDropOverlay'

interface ChatPageProps {
  conversationId: string | null
  onConversationUpdate?: () => void
  onNavigate?: (page: 'magic-templates') => void
}

export function ChatPage({
  conversationId,
  onConversationUpdate,
  onNavigate,
}: ChatPageProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)

  // Handle drag and drop overlay
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    const handleDragEnter = (e: DragEvent) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }

      const types = e.dataTransfer?.types || []
      const isDraggingContent =
        types.includes('Files') ||
        types.includes('text/uri-list') ||
        types.includes('text/html') ||
        Array.from(types).some((type) => type.includes('image'))

      if (isDraggingContent) {
        setDragCounter((prev) => prev + 1)
        setIsDragging(true)
      }
    }

    const handleDragLeave = () => {
      setDragCounter((prev) => {
        const newCounter = prev - 1
        if (newCounter <= 0) {
          timeoutId = setTimeout(() => {
            setIsDragging(false)
            setDragCounter(0)
          }, 50)
        }
        return Math.max(0, newCounter)
      })
    }

    const handleDragOver = (e: DragEvent) => {
      const types = e.dataTransfer?.types || []
      const isDraggingContent =
        types.includes('Files') ||
        types.includes('text/uri-list') ||
        types.includes('text/html')

      if (isDraggingContent) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    const handleDrop = (e: DragEvent) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }

      const types = e.dataTransfer?.types || []
      if (types.includes('text/uri-list') || types.includes('text/html')) {
        e.preventDefault()
        e.stopPropagation()
      }

      setIsDragging(false)
      setDragCounter(0)
    }

    document.addEventListener('dragenter', handleDragEnter, true)
    document.addEventListener('dragleave', handleDragLeave, true)
    document.addEventListener('dragover', handleDragOver, true)
    document.addEventListener('drop', handleDrop, true)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      document.removeEventListener('dragenter', handleDragEnter, true)
      document.removeEventListener('dragleave', handleDragLeave, true)
      document.removeEventListener('dragover', handleDragOver, true)
      document.removeEventListener('drop', handleDrop, true)
    }
  }, [])

  // Handle context menu image insertion
  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === 'INSERT_IMAGE' && message.imageUrl) {
        dataURLtoFile(message.imageUrl, 'image.png')
          .then((file) => {
            const event = new CustomEvent('agentx-insert-file', {
              detail: { file },
            })
            window.dispatchEvent(event)
          })
          .catch((error) => {
            console.error('[ChatPage] Failed to convert image:', error)
          })
      }
    }

    browser.runtime.onMessage.addListener(handleMessage)
    return () => browser.runtime.onMessage.removeListener(handleMessage)
  }, [])

  if (!conversationId) {
    return (
      <div className="flex size-full items-center justify-center bg-secondary">
        <p className="text-muted-foreground">Loading conversation...</p>
      </div>
    )
  }

  return (
    <>
      <DragDropOverlay visible={isDragging} />
      <ChatView
        key={conversationId}
        conversationId={conversationId}
        onConversationUpdate={onConversationUpdate}
        onNavigate={onNavigate}
      />
    </>
  )
}

// Helper function to convert data URL to File
async function dataURLtoFile(dataUrl: string, filename: string): Promise<File> {
  const response = await fetch(dataUrl)
  const blob = await response.blob()

  // Detect mime type from data URL
  const mimeType = dataUrl.match(/data:([^;]+);/)?.[1] || 'image/png'

  return new File([blob], filename, { type: mimeType })
}
