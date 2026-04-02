import { http, HttpResponse } from 'msw'
import { __serverDatabase } from '@/shared/lib/server'

export const authHandlers = [
  http.post('/auth/login', async ({ request }) => {
    const body = (await request.json()) as {
      email?: string
      password?: string
    }

    const maybeUser = __serverDatabase.user.findFirst({
      where: {
        email: {
          equals: body?.email
        }
      }
    })

    if (!maybeUser || maybeUser.password !== body?.password) {
      return HttpResponse.json({ message: 'Неправильный email или пароль' }, { status: 401 })
    }

    return HttpResponse.json({
      accessToken: `mock-token-${maybeUser.id}`,
      userId: maybeUser.id
    })
  }),

  http.post('/auth/logout', async () => {
    return new HttpResponse(null, { status: 200 })
  })
]
