'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

type Method = 'cash' | 'card' | 'momo' | 'stripe'

interface PaymentSelectorProps {
  method: Method
  isModalOpen: boolean
  onOpen: () => void
  onClose: () => void
  onChange: (m: Method) => void
}

export function PaymentSelector({ method, isModalOpen, onOpen, onClose, onChange }: PaymentSelectorProps) {
  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <button type="button" onClick={onOpen} className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-orange-50 transition-colors">
          <div className="flex items-center gap-2 text-left">
            <span className="text-lg" aria-hidden>{method === 'cash' ? '💵' : method === 'card' ? '💳' : method === 'stripe' ? '💳' : '📱'}</span>
            <span className="font-medium">{method === 'cash' ? 'Cash on Delivery' : method === 'card' ? 'Credit/Debit Card' : method === 'stripe' ? 'Stripe Payment' : 'MoMo Wallet'}</span>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700">Change</Badge>
        </button>
      </CardContent>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Select Payment Method</h3>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 space-y-3">
              {(['cash','card','stripe','momo'] as Method[]).map((m) => (
                <label key={m} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-orange-50 border border-gray-200 hover:border-orange-300 transition-colors">
                  <input type="radio" name="payment" value={m} checked={method===m} onChange={() => { onChange(m); onClose() }} className="text-orange-500" />
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{m === 'cash' ? '💵' : m === 'card' ? '💳' : m === 'stripe' ? '💳' : '📱'}</span>
                    <span className="font-medium">{m === 'cash' ? 'Cash on Delivery' : m === 'card' ? 'Credit/Debit Card' : m === 'stripe' ? 'Stripe Payment' : 'MoMo Wallet'}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}


