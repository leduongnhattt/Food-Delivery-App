"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

interface Enterprise {
  EnterpriseID: string
  EnterpriseName: string
}

export default function EnterpriseFilter({ 
  enterprises, 
  currentEnterpriseId,
  currentStatus,
  currentSearch,
  currentStartDate,
  currentEndDate
}: { 
  enterprises: Enterprise[]
  currentEnterpriseId?: string
  currentStatus?: string
  currentSearch?: string
  currentStartDate?: string
  currentEndDate?: string
}) {
  const router = useRouter()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  const apply = (enterpriseId: string) => {
    const p = new URLSearchParams(params.toString())
    if (currentStatus) p.set('status', currentStatus)
    if (currentSearch) p.set('q', currentSearch)
    else p.delete('q')
    if (currentStartDate) p.set('startDate', currentStartDate)
    else p.delete('startDate')
    if (currentEndDate) p.set('endDate', currentEndDate)
    else p.delete('endDate')
    if (enterpriseId) {
      p.set('enterpriseId', enterpriseId)
    } else {
      p.delete('enterpriseId')
    }
    startTransition(() => {
      router.replace(`/admin/reviews?${p.toString()}`, { scroll: false })
    })
  }

  const currentLabel = useMemo(() => {
    if (!currentEnterpriseId) return 'All Restaurants'
    return (
      enterprises.find((e) => e.EnterpriseID === currentEnterpriseId)
        ?.EnterpriseName || 'All Restaurants'
    )
  }, [currentEnterpriseId, enterprises])

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!open) return
      const t = e.target as Node | null
      if (!t) return
      if (rootRef.current && !rootRef.current.contains(t)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={isPending}
        onClick={() => setOpen((v) => !v)}
        className="relative group inline-flex items-center focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 transition-colors rounded gap-2 text-[13px] py-2.5 px-3 text-slate-900 bg-white ring ring-inset hover:bg-slate-50 disabled:bg-white focus:ring-2 focus:ring-inset focus:ring-indigo-200 pe-10 ring-slate-200 w-full shrink-0 sm:w-56"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="truncate">{currentLabel}</span>
        <ChevronDown
          className={`w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && !isPending && (
        <div className="absolute right-0 mt-2 w-full rounded-lg border border-slate-200 bg-white shadow-lg z-50 overflow-hidden">
          <button
            type="button"
            onClick={() => {
              apply('')
              setOpen(false)
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-[13px] md:text-[13px] text-slate-900 hover:bg-slate-50"
          >
            <span>All Restaurants</span>
            {!currentEnterpriseId && <Check className="w-4 h-4 text-slate-700" />}
          </button>
          {enterprises.map((ent) => (
            <button
              key={ent.EnterpriseID}
              type="button"
              onClick={() => {
                apply(ent.EnterpriseID)
                setOpen(false)
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-[13px] md:text-[13px] text-slate-900 hover:bg-slate-50"
            >
              <span className="truncate">{ent.EnterpriseName}</span>
              {currentEnterpriseId === ent.EnterpriseID && (
                <Check className="w-4 h-4 text-slate-700" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

