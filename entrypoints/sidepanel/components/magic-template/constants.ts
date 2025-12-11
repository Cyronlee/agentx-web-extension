export const TEMPLATE_VARIABLES = [
  {
    key: 'clipboard',
    label: 'Clipboard',
    description: "User's clipboard content",
  },
  { key: 'date', label: 'Date', description: "Today's date (YYYY-MM-DD)" },
  { key: 'time', label: 'Time', description: 'Current time (HH:MM)' },
  {
    key: 'selected',
    label: 'Selected Text',
    description: 'Selected text in the left side page',
  },
  { key: 'url', label: 'URL', description: 'Current web page URL' },
  {
    key: 'language',
    label: 'Language',
    description: "User's interface language",
  },
] as const

export type TemplateVariableKey = (typeof TEMPLATE_VARIABLES)[number]['key']
