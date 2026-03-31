import { http, HttpResponse } from 'msw'
import { config } from '@/shared/lib'
import { __serverDatabase } from '@/shared/lib/server'

export const authHandlers = [
  http.post(`${config.API_ENDPOINT}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as {
      email?: string
      password?: string
    }

    const email = body?.email
    const password = body?.password

    const maybeUser = __serverDatabase.user.findFirst({
      where: {
        email: {
          equals: email
        }
      }
    })

    if (!maybeUser || maybeUser.password !== password) {
      return HttpResponse.json({ message: 'Неправильный email или пароль' }, { status: 401 })
    }

    return HttpResponse.json({
      accessToken: `mock-token-${maybeUser.id}`,
      userId: maybeUser.id
    })
  }),

  http.post(`${config.API_ENDPOINT}/auth/logout`, async () => {
    return new HttpResponse(null, { status: 200 })
  })
]
