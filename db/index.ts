// Schema & Types
export type { Agent, Conversation, Message, MagicTemplate, ChatDBSchema } from './schema'
export { DB_NAME, DB_VERSION, DEFAULT_AGENT } from './schema'

// Operations
export {
  // Agent
  createAgent,
  getAgent,
  getAllAgents,
  updateAgent,
  deleteAgent,
  ensureDefaultAgent,
  // Conversation
  createConversation,
  getConversation,
  getAllConversations,
  getConversationsByAgentId,
  getLastConversation,
  updateConversation,
  deleteConversation,
  // Message
  addMessage,
  updateMessage,
  getMessagesByConversationId,
  deleteMessagesByConversationId,
  // Magic Template
  createMagicTemplate,
  getMagicTemplate,
  getAllMagicTemplates,
  updateMagicTemplate,
  deleteMagicTemplate,
  // Converters & Utils
  uiMessageToMessage,
  messageToUIMessage,
  parseAgentMCPConfig,
} from './operations'
