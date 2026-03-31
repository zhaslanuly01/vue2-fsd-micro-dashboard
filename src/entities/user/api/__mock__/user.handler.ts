import { http, HttpResponse } from 'msw'
import { config } from '@/shared/lib'
import { __serverDatabase } from '@/shared/lib/server'

export const userHandlers = [
  http.get(`${config.API_ENDPOINT}/profile`, async ({ request }) => {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    console.log('PROFILE authHeader', authHeader)
    console.log('PROFILE token', token)

    if (!token) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = Number(token.replace('mock-token-', ''))

    console.log('PROFILE userId', userId)
    console.log('PROFILE all users', __serverDatabase.user.getAll())

    const maybeUser = __serverDatabase.user.findFirst({
      where: {
        id: {
          equals: userId
        }
      }
    })

    console.log('PROFILE maybeUser', maybeUser)

    if (!maybeUser) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return HttpResponse.json({
      id: maybeUser.id,
      email: maybeUser.email,
      name: maybeUser.name,
      surname: maybeUser.surname,
      middle_name: maybeUser.middle_name,
      organization_id: maybeUser.organization_id,
      avatar_url: maybeUser.avatar_url,
      role: maybeUser.role
    })
  })
]
