import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import chatRouter from './routes/chat.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(
  cors({
    origin: [
      'chrome-extension://*',
      'http://localhost:*',
      'https://localhost:*',
    ],
    credentials: true,
  })
)
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
app.use('/api/chat', chatRouter)

// Error handling
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('[Server Error]:', err)
    res.status(500).json({
      error: err.message || 'Internal server error',
    })
  }
)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AgentX Backend running on http://localhost:${PORT}`)
  console.log(`   Health check: http://localhost:${PORT}/health`)
  console.log(`   Chat API: http://localhost:${PORT}/api/chat`)
})

