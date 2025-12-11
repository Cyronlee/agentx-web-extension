export default defineBackground(() => {
  console.log('Background script loaded!', { id: browser.runtime.id })

  // Handle extension icon click to open sidepanel
  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      await browser.sidePanel.open({ tabId: tab.id })
    }
  })

  // Set up sidepanel options on install
  browser.runtime.onInstalled.addListener(async () => {
    await browser.sidePanel.setOptions({
      path: 'sidepanel.html',
      enabled: true,
    })

    await browser.sidePanel.setPanelBehavior({
      openPanelOnActionClick: true,
    })

    // Create context menu for images
    browser.contextMenus.create({
      id: 'send-to-agentx',
      title: 'Send to AgentX',
      contexts: ['image'],
    })
  })

  // Handle context menu clicks
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'send-to-agentx' && tab?.id) {
      console.log('[Background] Context menu clicked for image')

      try {
        // Request the image from content script
        const response = await browser.tabs.sendMessage(tab.id, {
          type: 'GET_CONTEXT_IMAGE',
        })

        console.log('[Background] Received image response:', response)

        if (response.success && response.imageUrl) {
          // Forward the image to the sidepanel
          // We need to broadcast to all sidepanel instances
          browser.runtime
            .sendMessage({
              type: 'INSERT_IMAGE',
              imageUrl: response.imageUrl,
              originalUrl: response.originalUrl,
            })
            .catch((error) => {
              console.log('[Background] No sidepanel listening:', error)
            })
        }
      } catch (error) {
        console.error(
          '[Background] Failed to get image from content script:',
          error
        )
      }
    }
  })

  // Handle messages from sidepanel to get page context
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_PAGE_CONTEXT_REQUEST') {
      console.log('[Background] Received GET_PAGE_CONTEXT_REQUEST')

      // Get the active tab
      browser.tabs
        .query({ active: true, currentWindow: true })
        .then(async (tabs) => {
          console.log('[Background] Active tabs:', tabs)
          const activeTab = tabs[0]

          if (!activeTab?.id) {
            console.log('[Background] No active tab found')
            sendResponse({ selectedText: '', url: '' })
            return
          }

          const tabId = activeTab.id
          const tabUrl = activeTab.url || ''

          // Check if URL is restricted
          const isRestrictedUrl =
            tabUrl.startsWith('chrome://') ||
            tabUrl.startsWith('edge://') ||
            tabUrl.startsWith('about:') ||
            tabUrl.startsWith('chrome-extension://') ||
            tabUrl.includes('chromewebstore.google.com') ||
            tabUrl.includes('microsoftedge.microsoft.com/addons')

          if (isRestrictedUrl) {
            console.log(
              '[Background] Restricted URL, content script cannot be injected'
            )
            sendResponse({
              selectedText: '',
              url: tabUrl,
            })
            return
          }

          console.log(
            '[Background] Sending message to content script in tab:',
            tabId,
            'URL:',
            tabUrl
          )

          try {
            // Try to send message to content script
            const response = await browser.tabs.sendMessage(tabId, {
              type: 'GET_PAGE_CONTEXT',
            })
            console.log(
              '[Background] Received response from content script:',
              response
            )
            sendResponse(response)
          } catch (error) {
            console.log('[Background] Content script not available:', error)

            // Content script not loaded - provide fallback response with tab URL
            // This happens on restricted pages or before content script loads
            sendResponse({
              selectedText: '',
              url: tabUrl,
            })
          }
        })
        .catch((error) => {
          console.error('[Background] Failed to query tabs:', error)
          sendResponse({ selectedText: '', url: '' })
        })
      return true // Keep the message channel open for async response
    }
  })
})
