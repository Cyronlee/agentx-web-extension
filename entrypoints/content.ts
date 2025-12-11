export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    console.log('[Content Script] Loaded')

    // Store the last right-clicked image
    let lastContextImage: HTMLImageElement | null = null

    // Listen for context menu on images
    document.addEventListener('contextmenu', (event) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'IMG') {
        lastContextImage = target as HTMLImageElement
        console.log('[Content Script] Image right-clicked:', lastContextImage.src)
      } else {
        lastContextImage = null
      }
    })

    // Listen for messages from the extension (sidepanel or background)
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('[Content Script] Received message:', message)
      
      if (message.type === 'GET_PAGE_CONTEXT') {
        // Get selected text
        const selectedText = window.getSelection()?.toString() || ''
        
        // Get current URL
        const url = window.location.href
        
        const response = {
          selectedText,
          url,
        }
        
        console.log('[Content Script] Sending response:', response)
        sendResponse(response)
      }

      if (message.type === 'GET_CONTEXT_IMAGE') {
        console.log('[Content Script] GET_CONTEXT_IMAGE request')
        
        if (lastContextImage) {
          const imageSrc = lastContextImage.src
          console.log('[Content Script] Sending image:', imageSrc)
          
          // Convert image to data URL
          convertImageToDataURL(imageSrc)
            .then((dataUrl) => {
              sendResponse({
                success: true,
                imageUrl: dataUrl,
                originalUrl: imageSrc,
              })
            })
            .catch((error) => {
              console.error('[Content Script] Failed to convert image:', error)
              sendResponse({
                success: false,
                error: error.message,
              })
            })
        } else {
          sendResponse({
            success: false,
            error: 'No image in context',
          })
        }
        
        return true // Keep the message channel open for async response
      }

      return true // Keep the message channel open for async response
    })

    // Helper function to convert image URL to data URL
    async function convertImageToDataURL(imageUrl: string): Promise<string> {
      try {
        // If it's already a data URL, return it
        if (imageUrl.startsWith('data:')) {
          return imageUrl
        }

        // Fetch the image
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        
        // Convert to data URL
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      } catch (error) {
        console.error('[Content Script] Error converting image:', error)
        throw error
      }
    }
  },
});
