import { http, HttpResponse } from 'msw'
import { config } from '@/shared/lib'
import { __serverDatabase } from '@/shared/lib/server'
import { paginate, parseListQuery, sortByNumberField } from '@/shared/lib/server/query'

export const storageTankHandlers = [
  http.get(`${config.API_ENDPOINT}/storage-tanks`, ({ request }) => {
    const url = new URL(request.url)
    const query = parseListQuery(url)

    let items = __serverDatabase.storageTank.getAll()

    if (query.search) {
      const normalized = query.search.toLowerCase()

      items = items.filter(
        (item) =>
          item.tankNumber.toLowerCase().includes(normalized) ||
          item.terminalName.toLowerCase().includes(normalized)
      )
    }

    if (query.status) {
      items = items.filter((item) => item.status === query.status)
    }

    if (query.region) {
      items = items.filter((item) => item.region === query.region)
    }

    if (query.terminalName) {
      items = items.filter((item) => item.terminalName === query.terminalName)
    }

    if (query.productType) {
      items = items.filter((item) => item.productType === query.productType)
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
        terminalName: query.terminalName,
        productType: query.productType
      }
    })
  }),

  http.get(`${config.API_ENDPOINT}/storage-tanks/:id`, ({ params }) => {
    const id = Number(params.id)

    const item = __serverDatabase.storageTank.findFirst({
      where: {
        id: {
          equals: id
        }
      }
    })

    if (!item) {
      return HttpResponse.json({ message: 'Storage tank not found' }, { status: 404 })
    }

    return HttpResponse.json(item)
  })
]
