import { prisma } from '@/lib/db'
import ReviewSearch from '@/components/admin/ReviewSearch'
import TabsReviews from '@/components/admin/TabsReviews'
import EnterpriseFilter from '@/components/admin/EnterpriseFilter'
import AdminReviewRow from './AdminReviewRow'

export default async function AdminReviewsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ 
    status?: string
    q?: string
    enterpriseId?: string
    startDate?: string
    endDate?: string
  }> 
}) {
  const params = await searchParams
  const status = (params?.status || 'all') as 'all' | 'active' | 'hidden'
  const q = (params?.q || '').trim()
  const enterpriseId = params?.enterpriseId || ''
  const startDate = params?.startDate || ''
  const endDate = params?.endDate || ''

  // Build where clause
  const where: any = {}

  // Filter by hidden status
  // TODO: Uncomment after running migration and regenerating Prisma client
  // if (status === 'active') {
  //   where.IsHidden = false
  // } else if (status === 'hidden') {
  //   where.IsHidden = true
  // }

  // Filter by enterprise
  if (enterpriseId) {
    where.EnterpriseID = enterpriseId
  }

  // Filter by date range
  if (startDate || endDate) {
    where.CreatedAt = {}
    if (startDate) {
      where.CreatedAt.gte = new Date(startDate)
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      where.CreatedAt.lte = end
    }
  }

  // Search by comment, customer name, or enterprise name
  if (q) {
    where.OR = [
      { Comment: { contains: q } },
      { customer: { account: { Username: { contains: q } } } },
      { enterprise: { EnterpriseName: { contains: q } } }
    ]
  }

  // Fetch reviews
  // Try to include IsHidden field if it exists in database
  const reviews = await prisma.review.findMany({
    where,
    include: {
      customer: {
        select: {
          account: {
            select: {
              Username: true,
              Email: true
            }
          }
        }
      },
      enterprise: {
        select: {
          EnterpriseID: true,
          EnterpriseName: true
        }
      }
    },
    orderBy: {
      CreatedAt: 'desc'
    },
    take: 100
  })

  // Filter by IsHidden in memory (works even if field not in Prisma schema yet)
  // Use raw SQL to get IsHidden field directly from database
  let reviewsWithHidden: Array<{ ReviewID: string; IsHidden: boolean | null }> = []
  try {
    if (enterpriseId) {
      reviewsWithHidden = await prisma.$queryRaw<Array<{ ReviewID: string; IsHidden: boolean | null }>>`
        SELECT ReviewID, IsHidden FROM REVIEWS WHERE EnterpriseID = ${enterpriseId}
      `
    } else {
      reviewsWithHidden = await prisma.$queryRaw<Array<{ ReviewID: string; IsHidden: boolean | null }>>`
        SELECT ReviewID, IsHidden FROM REVIEWS
      `
    }
  } catch (error) {
    // If IsHidden column doesn't exist yet, all reviews are considered active
    console.log('IsHidden field may not exist yet:', error)
  }
  
  const hiddenMap = new Map(reviewsWithHidden.map(r => [r.ReviewID, r.IsHidden ?? false]))
  
  // Filter by IsHidden status
  let filteredReviews = reviews
  if (status === 'active' || status === 'hidden') {
    filteredReviews = reviews.filter((review: any) => {
      const isHidden = hiddenMap.get(review.ReviewID) ?? false
      if (status === 'active') {
        return !isHidden // Show only non-hidden reviews
      } else {
        return isHidden // Show only hidden reviews
      }
    })
  }

  // Get all enterprises for filter dropdown
  const enterprises = await prisma.enterprise.findMany({
    select: {
      EnterpriseID: true,
      EnterpriseName: true
    },
    orderBy: {
      EnterpriseName: 'asc'
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Reviews</h1>
          <p className="text-slate-600 mt-1">Manage all customer reviews and ratings</p>
        </div>
        <ReviewSearch 
          currentStatus={status} 
          currentSearch={q}
          currentEnterpriseId={enterpriseId}
          currentStartDate={startDate}
          currentEndDate={endDate}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <TabsReviews current={status} search={q} enterpriseId={enterpriseId} startDate={startDate} endDate={endDate} />
          
          {/* Enterprise Filter */}
          <EnterpriseFilter 
            enterprises={enterprises} 
            currentEnterpriseId={enterpriseId}
            currentStatus={status}
            currentSearch={q}
            currentStartDate={startDate}
            currentEndDate={endDate}
          />
        </div>

        {/* Search Results Info */}
        {(q || status !== 'all' || enterpriseId || startDate || endDate) && (
          <div className="mt-4 mb-2 text-sm text-slate-600">
            <div className="flex flex-wrap items-center gap-2">
              {q && (
                <span>Found {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''} matching "{q}"</span>
              )}
              {!q && (
                <span>Showing {filteredReviews.length} {status === 'all' ? '' : status} review{filteredReviews.length !== 1 ? 's' : ''}</span>
              )}
              {enterpriseId && enterprises.find(e => e.EnterpriseID === enterpriseId) && (
                <span className="text-slate-500">
                  • {enterprises.find(e => e.EnterpriseID === enterpriseId)?.EnterpriseName}
                </span>
              )}
              {(startDate || endDate) && (
                <span className="text-slate-500">
                  • {startDate ? new Date(startDate).toLocaleDateString() : 'Start'} - {endDate ? new Date(endDate).toLocaleDateString() : 'End'}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Restaurant</th>
                <th className="py-2 pr-4">Rating</th>
                <th className="py-2 pr-4">Comment</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-slate-500 py-8">
                    No reviews found
                  </td>
                </tr>
              ) : filteredReviews.map(review => {
                // Get IsHidden from raw query result
                const reviewWithHidden = reviewsWithHidden.find(r => r.ReviewID === review.ReviewID)
                const isHidden = reviewWithHidden?.IsHidden ?? false
                return (
                  <AdminReviewRow 
                    key={review.ReviewID} 
                    review={{ ...review, IsHidden: isHidden } as any} 
                  />
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

