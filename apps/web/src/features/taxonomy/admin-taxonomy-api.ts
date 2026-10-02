import { apiRequest } from '../../lib/api-client'

export type TaxonomyKind = 'categories' | 'tags'

export type TaxonomyItem = {
  id: string
  name: string
  slug: string
}

export function createTaxonomyItem(kind: TaxonomyKind, name: string) {
  return apiRequest<TaxonomyItem>(`/admin/${kind}`, {
    method: 'POST',
    body: { name },
  })
}

export function updateTaxonomyItem(
  kind: TaxonomyKind,
  id: string,
  input: { name: string; slug: string },
) {
  return apiRequest<TaxonomyItem>(`/admin/${kind}/${id}`, {
    method: 'PATCH',
    body: input,
  })
}

export function deleteTaxonomyItem(kind: TaxonomyKind, id: string) {
  return apiRequest<void>(`/admin/${kind}/${id}`, { method: 'DELETE' })
}
