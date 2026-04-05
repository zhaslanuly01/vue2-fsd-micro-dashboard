import 'dotenv/config'
import express, { type Request, type Response } from 'express'
import cors from 'cors'
import OpenAI from 'openai'

const app = express()

const PORT = Number(process.env.PORT || 3001)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required')
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
})

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    ok: true
  })
})

type ChatRequestBody = {
  question?: string
  page?: string
  filters?: Record<string, unknown>
  context?: Record<string, unknown>
}

app.post('/api/chat', async (req: Request<{}, {}, ChatRequestBody>, res: Response) => {
  try {
    const { question, page, filters = {}, context = {} } = req.body

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: 'Question is required'
      })
    }

    const systemPrompt = `
Ты AI-ассистент внутри аналитического dashboard.
Отвечай на русском языке.
Отвечай кратко, по делу, в 3-6 пунктах или коротким абзацем.
Не выдумывай данные, которых нет в контексте.
Если данных недостаточно, так и скажи.
`

    const userPrompt = `
Текущая страница: ${page || 'unknown'}

Фильтры:
${JSON.stringify(filters, null, 2)}

Контекст:
${JSON.stringify(context, null, 2)}

Вопрос пользователя:
${question}
`

    const response = await openai.responses.create({
      model: OPENAI_MODEL,
      input: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ]
    })

    return res.json({
      message: response.output_text || 'Не удалось получить ответ'
    })
  } catch (error) {
    console.error('OpenAI error:', error)

    return res.status(500).json({
      error: 'Failed to get AI response'
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`)
})
