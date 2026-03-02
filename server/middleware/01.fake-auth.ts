export default defineEventHandler((event) => {
  if (!event.path.startsWith('/api/')) return
  if (event.method === 'GET' || event.method === 'HEAD' || event.method === 'OPTIONS') return

  const token = getHeader(event, 'x-fake-token')
  if (token === 'dev-token') return

  throw createError({ statusCode: 401, statusMessage: 'Unauthorized: missing fake token' })
})
