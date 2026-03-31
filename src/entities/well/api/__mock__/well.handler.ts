import { http, HttpResponse } from 'msw'
import { config } from '@/shared/lib'
import { __serverDatabase } from '@/shared/lib/server'
import { paginate, parseListQuery, sortByNumberField } from '@/shared/lib/server/query'

export const wellsHandlers = [
  http.get(`${config.API_ENDPOINT}/wells`, ({ request }) => {
    const url = new URL(request.url)
    const query = parseListQuery(url)

    let items = __serverDatabase.well.getAll()

    if (query.search) {
      const normalized = query.search.toLowerCase()
      items = items.filter(
        (item) =>
          item.wellNumber.toLowerCase().includes(normalized) ||
          item.name.toLowerCase().includes(normalized)
      )
    }

    if (query.status) {
      items = items.filter((item) => item.status === query.status)
    }

    if (query.region) {
      items = items.filter((item) => item.region === query.region)
    }

    if (query.fieldName) {
      items = items.filter((item) => item.fieldName === query.fieldName)
    }

    items = sortByNumberField(items, query.sortBy, query.sortOrder)

    const result = paginate(items, query.page, query.pageSize)

    return HttpResponse.json({
      items: result.items,
      pagination: result.pagination,
      filters: {
        search: query.search,
        status: query.status,
        region: query.region,
        fieldName: query.fieldName
      }
    })
  }),

  http.get(`${config.API_ENDPOINT}/wells/:id`, ({ params }) => {
    const id = Number(params.id)

    const item = __serverDatabase.well.findFirst({
      where: {
        id: {
          equals: id
        }
      }
    })

    if (!item) {
      return HttpResponse.json({ message: 'Well not found' }, { status: 404 })
    }

    return HttpResponse.json(item)
  })
]
