import { Hono } from 'hono'
import { handle } from 'hono/vercel'

export const runtime = 'edge'

const WORKER_URL = 'https://shy-salad-7696.my-quiz-worker123.workers.dev/'

const app = new Hono()

app.get('/api/quiz', async (c) => {
  try {
    const res = await fetch(WORKER_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const errJson = await res.json()
        return c.json(errJson)
      }
      const errText = await res.text()
      return c.text(errText)
    }

    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const data = await res.json()
      return c.json(data)
    }
    
    const text = await res.text()
    return c.text(text)
  } catch {
    c.status(500)
    return c.json({ error: 'Failed to fetch quiz data' })
  }
})

export const GET = handle(app)