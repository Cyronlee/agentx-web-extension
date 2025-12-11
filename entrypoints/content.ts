export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    console.log('[Content Script] Loaded')

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
      return true // Keep the message channel open for async response
    })
  },
});
