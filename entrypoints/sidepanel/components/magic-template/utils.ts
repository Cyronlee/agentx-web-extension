interface PageContext {
  selectedText: string
  url: string
}

export async function getClipboardContent(): Promise<string> {
  try {
    const text = await navigator.clipboard.readText()
    return text
  } catch (error) {
    console.error('Failed to read clipboard:', error)
    return ''
  }
}

export async function getPageContext(): Promise<PageContext> {
  try {
    console.log('Requesting page context from background...')
    const response = await browser.runtime.sendMessage({
      type: 'GET_PAGE_CONTEXT_REQUEST',
    })
    console.log('Received page context response:', response)
    return {
      selectedText: response?.selectedText || '',
      url: response?.url || '',
    }
  } catch (error) {
    console.error('Failed to get page context:', error)
    return { selectedText: '', url: '' }
  }
}

export function getCurrentDate(): string {
  const now = new Date()
  return now.toISOString().split('T')[0] // YYYY-MM-DD
}

export function getCurrentTime(): string {
  const now = new Date()
  return now.toTimeString().split(' ')[0].slice(0, 5) // HH:MM
}

export function getLanguage(): string {
  const lang = (
    navigator.language ||
    (navigator as any).userLanguage ||
    'en-US'
  ).toLowerCase()

  if (lang.startsWith('en')) {
    return 'English'
  }
  if (lang.startsWith('zh')) {
    return '中文'
  }

  const prefixMap: Record<string, string> = {
    ja: '日本語',
    ko: '한국어',
    fr: 'Français',
    de: 'Deutsch',
    es: 'Español',
    pt: 'Português',
    ru: 'Русский',
    it: 'Italiano',
    nl: 'Nederlands',
    pl: 'Polski',
    tr: 'Türkçe',
    th: 'ไทย',
    vi: 'Tiếng Việt',
    id: 'Bahasa Indonesia',
    ms: 'Bahasa Melayu',
    ar: 'العربية',
    hi: 'हिन्दी',
  }

  const prefix = lang.split('-')[0]
  return prefixMap[prefix] || 'English'
}

export async function processTemplate(template: string): Promise<string> {
  let processed = template

  // Get clipboard content
  const clipboard = await getClipboardContent()
  processed = processed.replace(/\{\{clipboard\}\}/g, clipboard)

  // Get date and time
  processed = processed.replace(/\{\{date\}\}/g, getCurrentDate())
  processed = processed.replace(/\{\{time\}\}/g, getCurrentTime())

  // Get language
  processed = processed.replace(/\{\{language\}\}/g, getLanguage())

  // Get page context (selected text and URL)
  const pageContext = await getPageContext()
  processed = processed.replace(/\{\{selected\}\}/g, pageContext.selectedText)
  processed = processed.replace(/\{\{url\}\}/g, pageContext.url)

  return processed
}
