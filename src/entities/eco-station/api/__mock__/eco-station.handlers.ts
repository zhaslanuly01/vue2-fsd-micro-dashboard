import { http, HttpResponse } from 'msw'
import { config } from '@/shared/lib'
import { __serverDatabase } from '@/shared/lib/server'
import { paginate, parseListQuery, sortByNumberField } from '@/shared/lib/server/query'

export const ecoStationHandlers = [
  http.get(`${config.API_ENDPOINT}/eco-stations`, ({ request }) => {
    const url = new URL(request.url)
    const query = parseListQuery(url)

    let items = __serverDatabase.ecoStation.getAll()

    if (query.search) {
      const normalized = query.search.toLowerCase()

      items = items.filter(
        (item) =>
          item.stationName.toLowerCase().includes(normalized) ||
          item.fieldName.toLowerCase().includes(normalized) ||
          item.region.toLowerCase().includes(normalized) ||
          item.responsibleUnit.toLowerCase().includes(normalized)
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

    if (query.responsibleUnit) {
      items = items.filter((item) => item.responsibleUnit === query.responsibleUnit)
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
        fieldName: query.fieldName,
        responsibleUnit: query.responsibleUnit
      }
    })
  }),

  http.get(`${config.API_ENDPOINT}/eco-stations/:id`, ({ params }) => {
    const id = Number(params.id)

    const item = __serverDatabase.ecoStation.findFirst({
      where: {
        id: {
          equals: id
        }
      }
    })

    if (!item) {
      return HttpResponse.json({ message: 'Eco station not found' }, { status: 404 })
    }

    return HttpResponse.json(item)
  })
]
