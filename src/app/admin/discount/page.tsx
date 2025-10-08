import { prisma } from '@/lib/db'
import { Search } from 'lucide-react'
import { AdminVoucherRow } from './AdminVoucherRow'
import AdminCreateVoucherForm from './AdminCreateVoucherForm'

export default async function AdminDiscountPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const params = await searchParams
  const status = (params?.status || 'pending') as 'pending' | 'approved' | 'all'
  const q = (params?.q || '').trim()

  const where: any = {}
  if (status === 'pending') where.Status = 'Pending'
  if (status === 'approved') where.Status = 'Approved'
  if (q) {
    where.OR = [
      { Code: { contains: q, mode: 'insensitive' } },
      { enterprise: { is: { EnterpriseName: { contains: q, mode: 'insensitive' } } } },
    ]
  }

  const vouchers = await prisma.voucher.findMany({
    where,
    orderBy: { CreatedAt: 'desc' },
    take: 50,
    select: {
      VoucherID: true,
      Code: true,
      DiscountPercent: true,
      DiscountAmount: true,
      Status: true,
      ExpiryDate: true,
      MaxUsage: true,
      UsedCount: true,
      CreatedAt: true,
      enterprise: { select: { EnterpriseName: true } }
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
    <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Discounts</h1>
          <p className="text-slate-600 mt-1">Approve pending vouchers from enterprises</p>
        </div>
        <form className="flex items-center gap-2" action="/admin/discount" method="get">
          <input type="hidden" name="status" value={status} />
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input name="q" defaultValue={q} placeholder="Search code or enterprise" className="pl-9 w-72 h-9 rounded-md border border-slate-200" />
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <AdminCreateVoucherForm onCreated={async ()=>{ 'use server'; }} />
        </div>
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <a href="/admin/discount?status=pending" className={`px-3 py-1.5 rounded-md text-sm border ${status==='pending'?'bg-indigo-600 text-white border-indigo-600':'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>Pending</a>
          <a href="/admin/discount?status=approved" className={`px-3 py-1.5 rounded-md text-sm border ${status==='approved'?'bg-indigo-600 text-white border-indigo-600':'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>Approved</a>
          <a href="/admin/discount?status=all" className={`px-3 py-1.5 rounded-md text-sm border ${status==='all'?'bg-indigo-600 text-white border-indigo-600':'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>All</a>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {vouchers.length === 0 ? (
            <div className="text-slate-500 text-sm py-8 text-center">No vouchers found</div>
          ) : vouchers.map(v => (
            <AdminVoucherRow key={v.VoucherID} voucher={{
              VoucherID: v.VoucherID,
              Code: v.Code,
              DiscountPercent: v.DiscountPercent ? Number(v.DiscountPercent) : undefined,
              DiscountAmount: v.DiscountAmount ? Number(v.DiscountAmount) : undefined,
              MinOrderValue: undefined,
              MaxUsage: typeof v.MaxUsage === 'number' ? v.MaxUsage : undefined,
              UsedCount: v.UsedCount,
              ExpiryDate: v.ExpiryDate ? new Date(v.ExpiryDate).toISOString() : '',
              Status: v.Status
            }} />
          ))}
        </div>
      </div>
      </div>
    </div>
  )
}

 