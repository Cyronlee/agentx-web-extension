import { useEffect } from 'react'
import { usePromptInputAttachments } from '@/components/ai-elements/prompt-input'

/**
 * Helper function to check if URL is an image
 */
function isImageUrl(url: string): boolean {
  const imageExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.bmp',
    '.svg',
  ]
  const lowerUrl = url.toLowerCase()

  // Check file extension
  if (imageExtensions.some((ext) => lowerUrl.includes(ext))) {
    return true
  }

  // Check if URL starts with data:image
  if (lowerUrl.startsWith('data:image/')) {
    return true
  }

  return false
}

/**
 * Helper function to convert URL to File
 */
async function urlToFile(url: string): Promise<File> {
  const response = await fetch(url)
  const blob = await response.blob()

  const urlPath = new URL(url).pathname
  const filename = urlPath.split('/').pop() || 'image.png'
  const mimeType = blob.type || 'image/png'

  return new File([blob], filename, { type: mimeType })
}

/**
 * Helper function to convert data URL to File
 */
export async function dataUrlToFile(
  dataUrl: string,
  filename: string = `screenshot-${Date.now()}.png`
): Promise<File> {
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  return new File([blob], filename, { type: 'image/png' })
}

/**
 * Hook to handle file injection via custom events
 * Listens for 'agentx-insert-file' events and adds files to attachments
 */
export function useFileInjector() {
  const attachments = usePromptInputAttachments()

  useEffect(() => {
    const handleInsertFile = (event: Event) => {
      const customEvent = event as CustomEvent<{ file: File }>
      if (customEvent.detail?.file) {
        attachments.add([customEvent.detail.file])
      }
    }

    window.addEventListener('agentx-insert-file', handleInsertFile)
    return () =>
      window.removeEventListener('agentx-insert-file', handleInsertFile)
  }, [attachments])
}

/**
 * Hook to handle dropping URIs (images from web pages)
 * Automatically fetches and adds images from dropped URIs
 */
export function useUriDropHandler() {
  const attachments = usePromptInputAttachments()

  useEffect(() => {
    const handleDrop = async (e: DragEvent) => {
      const types = e.dataTransfer?.types || []

      if (types.includes('text/uri-list')) {
        const uriList = e.dataTransfer?.getData('text/uri-list')

        if (uriList) {
          const uris = uriList
            .split('\n')
            .filter((uri) => uri.trim() && !uri.startsWith('#'))

          for (const uri of uris) {
            const trimmedUri = uri.trim()

            if (isImageUrl(trimmedUri)) {
              try {
                const file = await urlToFile(trimmedUri)
                attachments.add([file])
              } catch (error) {
                console.error('[UriDropHandler] Failed to fetch image:', error)
              }
            }
          }
        }
      }
    }

    document.addEventListener('drop', handleDrop, true)
    return () => document.removeEventListener('drop', handleDrop, true)
  }, [attachments])
}

