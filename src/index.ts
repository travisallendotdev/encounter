import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { migrate } from './db/migrate.js'
import auth from './routes/auth.js'
import campaigns from './routes/campaigns.js'
import { authMiddleware } from './middleware/auth.js'
import type { Variables } from './types.js'

migrate()

const app = new Hono<{ Variables: Variables }>()

app.use('*', async (c, next) => {
  if (c.req.path === '/api/auth/login' && c.req.method === 'POST') {
    return next()
  }
  return authMiddleware(c, next)
})

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/api/auth', auth)
app.route('/api/campaigns', campaigns)

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
