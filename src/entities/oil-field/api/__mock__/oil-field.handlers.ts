import { http, HttpResponse } from 'msw'
import { config } from '@/shared/lib'
import { __serverDatabase } from '@/shared/lib/server'
import { paginate, parseListQuery, sortByNumberField } from '@/shared/lib/server/query'

export const oilFieldHandlers = [
  http.get(`${config.API_ENDPOINT}/oil-fields`, ({ request }) => {
    const url = new URL(request.url)
    const query = parseListQuery(url)

    let items = __serverDatabase.oilField.getAll()

    if (query.search) {
      const normalized = query.search.toLowerCase()

      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(normalized) ||
          item.region.toLowerCase().includes(normalized) ||
          item.contractor.toLowerCase().includes(normalized)
      )
    }

    if (query.status) {
      items = items.filter((item) => item.status === query.status)
    }

    if (query.region) {
      items = items.filter((item) => item.region === query.region)
    }

    if (query.contractor) {
      items = items.filter((item) => item.contractor === query.contractor)
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
        contractor: query.contractor
      }
    })
  }),

  http.get(`${config.API_ENDPOINT}/oil-fields/:id`, ({ params }) => {
    const id = Number(params.id)

    const item = __serverDatabase.oilField.findFirst({
      where: {
        id: {
          equals: id
        }
      }
    })

    if (!item) {
      return HttpResponse.json({ message: 'Oil field not found' }, { status: 404 })
    }

    return HttpResponse.json(item)
  })
]
