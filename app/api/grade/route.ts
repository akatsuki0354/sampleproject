import { Hono } from 'hono'
import { handle } from 'hono/vercel'

export const runtime = 'edge'

const WORKER_URL = 'https://shy-salad-7696.my-quiz-worker123.workers.dev/'

const app = new Hono()

app.post('/api/grade', async (c) => {
  try {
    const payload = await c.req.json()

    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    if (!res.ok) {
      return c.json({ error: 'Upstream error', status: res.status })
    }

    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const data = await res.json()
      return c.json(data)
    }
    const text = await res.text()
    return c.text(text)
  } catch (err) {
    c.status(500)
    return c.json({ error: 'Failed to post grade data' })
  }
})

export const POST = handle(app)

