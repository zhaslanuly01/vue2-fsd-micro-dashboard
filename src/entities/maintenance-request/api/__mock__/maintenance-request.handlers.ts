import { http, HttpResponse } from 'msw'
import { config } from '@/shared/lib'
import { __serverDatabase } from '@/shared/lib/server'
import { paginate, parseListQuery, sortByNumberField } from '@/shared/lib/server/query'

export const maintenanceRequestHandlers = [
  http.get(`${config.API_ENDPOINT}/maintenance-requests`, ({ request }) => {
    const url = new URL(request.url)
    const query = parseListQuery(url)

    let items = __serverDatabase.maintenanceRequest.getAll()

    if (query.search) {
      const normalized = query.search.toLowerCase()

      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(normalized) ||
          item.objectName.toLowerCase().includes(normalized) ||
          item.fieldName.toLowerCase().includes(normalized) ||
          item.responsibleTeam.toLowerCase().includes(normalized)
      )
    }

    if (query.status) {
      items = items.filter((item) => item.status === query.status)
    }

    if (query.fieldName) {
      items = items.filter((item) => item.fieldName === query.fieldName)
    }

    if (query.priority) {
      items = items.filter((item) => item.priority === query.priority)
    }

    if (query.responsibleTeam) {
      items = items.filter((item) => item.responsibleTeam === query.responsibleTeam)
    }

    items = sortByNumberField(items, query.sortBy, query.sortOrder)

    const result = paginate(items, query.page, query.pageSize)

    return HttpResponse.json({
      items: result.items,
      pagination: result.pagination,
      filters: {
        search: query.search,
        status: query.status,
        fieldName: query.fieldName,
        priority: query.priority,
        responsibleTeam: query.responsibleTeam
      }
    })
  }),

  http.get(`${config.API_ENDPOINT}/maintenance-requests/:id`, ({ params }) => {
    const id = Number(params.id)

    const item = __serverDatabase.maintenanceRequest.findFirst({
      where: {
        id: {
          equals: id
        }
      }
    })

    if (!item) {
      return HttpResponse.json({ message: 'Maintenance request not found' }, { status: 404 })
    }

    return HttpResponse.json(item)
  })
]
