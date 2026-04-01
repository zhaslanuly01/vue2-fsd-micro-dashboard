import { http, HttpResponse } from 'msw'
import { config } from '@/shared/lib'
import { __serverDatabase } from '@/shared/lib/server'
import { paginate, parseListQuery, sortByNumberField } from '@/shared/lib/server/query'

export const pipelineHandlers = [
  http.get(`${config.API_ENDPOINT}/pipeline-sections`, ({ request }) => {
    const url = new URL(request.url)
    const query = parseListQuery(url)

    let items = __serverDatabase.pipelineSection.getAll()

    if (query.search) {
      const normalized = query.search.toLowerCase()

      items = items.filter(
        (item) =>
          item.sectionName.toLowerCase().includes(normalized) ||
          item.region.toLowerCase().includes(normalized)
      )
    }

    if (query.status) {
      items = items.filter((item) => item.status === query.status)
    }

    if (query.region) {
      items = items.filter((item) => item.region === query.region)
    }

    items = sortByNumberField(items, query.sortBy, query.sortOrder)

    const result = paginate(items, query.page, query.pageSize)

    return HttpResponse.json({
      items: result.items,
      pagination: result.pagination,
      filters: {
        search: query.search,
        status: query.status,
        region: query.region
      }
    })
  }),

  http.get(`${config.API_ENDPOINT}/pipeline-sections/:id`, ({ params }) => {
    const id = Number(params.id)

    const item = __serverDatabase.pipelineSection.findFirst({
      where: {
        id: {
          equals: id
        }
      }
    })

    if (!item) {
      return HttpResponse.json({ message: 'Pipeline section not found' }, { status: 404 })
    }

    return HttpResponse.json(item)
  })
]
