'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Truck } from 'lucide-react'

interface DeliveryFormProps {
  phone: string
  address: string
  onChange: (next: { phone: string; address: string }) => void
}

export function DeliveryForm({ phone, address, onChange }: DeliveryFormProps) {
  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-orange-500" />
          Delivery Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Phone Number</label>
          <Input
            placeholder="Enter your phone number"
            className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            value={phone}
            onChange={(e) => onChange({ phone: e.target.value, address })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Delivery Address</label>
          <Input
            placeholder="Enter your delivery address"
            className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            value={address}
            onChange={(e) => onChange({ phone, address: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  )
}


