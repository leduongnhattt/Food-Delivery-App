import { API_BASE_URL } from './api'

const REVIEWS_BASE = `${API_BASE_URL}/reviews`
const ENTERPRISE_REVIEWS_BASE = `${API_BASE_URL}/enterprise/reviews`
const ADMIN_REVIEWS_BASE = `${API_BASE_URL}/admin/reviews`

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('access_token')
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

export interface CreateReviewResponse {
  success: boolean
  review: {
    id: string
    author: string
    rating: number
    content: string
    images: string[]
    createdAt: string
  }
}

export async function createReview(params: {
  enterpriseId: string
  rating?: number
  comment?: string
  images?: File[]
}): Promise<CreateReviewResponse> {
  const formData = new FormData()
  formData.append('enterpriseId', params.enterpriseId)
  if (params.rating != null && params.rating > 0) {
    formData.append('rating', String(params.rating))
  }
  if (params.comment?.trim()) {
    formData.append('comment', params.comment.trim())
  }
  params.images?.forEach((file) => formData.append('images', file))

  const res = await fetch(REVIEWS_BASE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
    credentials: 'include',
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit review')
  }
  return data
}

export async function getEnterpriseReviews(params: {
  q?: string
  rating?: string
  status?: string
  startDate?: string
  endDate?: string
  sort?: string
  page?: number
  limit?: number
}): Promise<{
  success: boolean
  reviews: Array<{
    id: string
    customerName: string
    customerEmail: string | null
    rating: number
    comment: string
    createdAt: string
    updatedAt: string | null
    images: string[]
    isHidden: boolean
  }>
  stats: {
    averageRating: number
    totalReviews: number
    ratingDistribution: Record<string, number>
    visibleCount: number
    hiddenCount: number
    supportsVisibility: boolean
  }
  pagination: { page: number; limit: number; total: number; totalPages: number }
  features: { visibilityToggle: boolean }
}> {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') search.set(k, String(v))
  })
  const res = await fetch(`${ENTERPRISE_REVIEWS_BASE}?${search}`, {
    method: 'GET',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to fetch reviews')
  return data
}

export async function patchEnterpriseReview(
  reviewId: string,
  isHidden: boolean
): Promise<{ success: boolean; reviewId: string; isHidden: boolean }> {
  const res = await fetch(`${ENTERPRISE_REVIEWS_BASE}/${reviewId}`, {
    method: 'PATCH',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ isHidden }),
    credentials: 'include',
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to update review')
  return data
}

export async function getAdminReviews(params: {
  q?: string
  enterpriseId?: string
  status?: string
  startDate?: string
  endDate?: string
}): Promise<{
  reviews: Array<{
    id: string
    customerName: string
    customerEmail: string
    enterpriseId: string
    enterpriseName: string
    rating: number
    comment: string
    images: string[]
    createdAt: string
    updatedAt: string | null
    isHidden: boolean
  }>
  total: number
}> {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') search.set(k, String(v))
  })
  const res = await fetch(`${ADMIN_REVIEWS_BASE}?${search}`, {
    method: 'GET',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to fetch reviews')
  return data
}

export async function patchAdminReview(
  reviewId: string,
  isHidden: boolean
): Promise<{ success: boolean; review: { id: string; isHidden: boolean } }> {
  const res = await fetch(`${ADMIN_REVIEWS_BASE}/${reviewId}`, {
    method: 'PATCH',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ isHidden }),
    credentials: 'include',
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to update review')
  return data
}
