import { http, HttpResponse } from 'msw'
import { config } from '@/shared/lib'
import { __serverDatabase } from '@/shared/lib/server'
import { paginate, parseListQuery, sortByNumberField } from '@/shared/lib/server/query'

export const equipmentHandlers = [
  http.get(`${config.API_ENDPOINT}/equipment`, ({ request }) => {
    const url = new URL(request.url)
    const query = parseListQuery(url)

    let items = __serverDatabase.equipment.getAll()

    if (query.search) {
      const normalized = query.search.toLowerCase()

      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(normalized) ||
          item.fieldName.toLowerCase().includes(normalized) ||
          item.type.toLowerCase().includes(normalized)
      )
    }

    if (query.status) {
      items = items.filter((item) => item.status === query.status)
    }

    if (query.fieldName) {
      items = items.filter((item) => item.fieldName === query.fieldName)
    }

    if (query.type) {
      items = items.filter((item) => item.type === query.type)
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
        type: query.type
      }
    })
  }),

  http.get(`${config.API_ENDPOINT}/equipment/:id`, ({ params }) => {
    const id = Number(params.id)

    const item = __serverDatabase.equipment.findFirst({
      where: {
        id: {
          equals: id
        }
      }
    })

    if (!item) {
      return HttpResponse.json({ message: 'Equipment not found' }, { status: 404 })
    }

    return HttpResponse.json(item)
  })
]
