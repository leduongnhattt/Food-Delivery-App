'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Gift, Info, X } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Offer {
  code: string
  discount: number
  description: string
  eligible: boolean
}

interface PromoOffersProps {
  applied: { code: string; discount: number } | null
  offers: Offer[]
  isModalOpen: boolean
  onOpenModal: () => void
  onCloseModal: () => void
  onApply: (code: string) => void
  onRemove: () => void
}

export function PromoOffers({ applied, offers, isModalOpen, onOpenModal, onCloseModal, onApply, onRemove }: PromoOffersProps) {
  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-orange-500" />
          Promo Code
        </CardTitle>
      </CardHeader>
      <CardContent>
        {applied ? (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium text-green-800">{applied.code}</span>
              <span className="text-green-600">-{formatPrice(applied.discount)}</span>
            </div>
            <Button size="sm" variant="ghost" onClick={onRemove} className="text-red-500 hover:text-red-700">Remove</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Info className="w-4 h-4 mt-0.5" />
              <span>Some offers cannot be used. Click to view available offers.</span>
            </div>
            <Button className="w-full justify-between bg-orange-500 hover:bg-orange-600 text-white" onClick={onOpenModal}>
              <span className="flex items-center gap-2">
                <span aria-hidden>🎟️</span>
                View available offers
              </span>
            </Button>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onCloseModal} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Available Offers</h3>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={onCloseModal}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                {offers.map((offer) => (
                  <div key={offer.code} className={`flex items-center justify-between p-3 rounded-lg border ${offer.eligible ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-70'}`}>
                    <div>
                      <div className="font-medium">{offer.code} - {formatPrice(offer.discount)} off</div>
                      <div className="text-xs text-gray-600">{offer.description}</div>
                    </div>
                    <Button size="sm" disabled={!offer.eligible} onClick={() => onApply(offer.code)}>Apply</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


