export type SortOrder = 'asc' | 'desc'

export interface ListQueryParams {
  search: string
  status: string
  region: string
  fieldName: string

  terminalName: string
  productType: string

  page: number
  pageSize: number
  sortBy: string
  sortOrder: SortOrder
}

export function parseListQuery(url: URL): ListQueryParams {
  const sortOrderParam = url.searchParams.get('sortOrder')
  return {
    search: url.searchParams.get('search') ?? '',
    status: url.searchParams.get('status') ?? '',
    region: url.searchParams.get('region') ?? '',
    fieldName: url.searchParams.get('fieldName') ?? '',

    terminalName: url.searchParams.get('terminalName') ?? '',
    productType: url.searchParams.get('productType') ?? '',

    page: Number(url.searchParams.get('page') ?? 1),
    pageSize: Number(url.searchParams.get('pageSize') ?? 10),
    sortBy: url.searchParams.get('sortBy') ?? '',

    sortOrder: sortOrderParam === 'desc' || sortOrderParam === 'asc' ? sortOrderParam : 'asc'
  }
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  const end = start + pageSize

  return {
    items: items.slice(start, end),
    pagination: {
      page,
      pageSize,
      total: items.length,
      totalPages: Math.ceil(items.length / pageSize)
    }
  }
}

export function sortByNumberField<T>(
  items: T[],
  sortBy: string,
  sortOrder: SortOrder = 'asc'
): T[] {
  if (!sortBy) {
    return items
  }

  return [...items].sort((a, b) => {
    const aValue = Number((a as Record<string, unknown>)[sortBy] ?? 0)
    const bValue = Number((b as Record<string, unknown>)[sortBy] ?? 0)

    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
  })
}
