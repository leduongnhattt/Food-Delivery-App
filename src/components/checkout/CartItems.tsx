'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { formatPrice, calculatePrice } from '@/lib/utils'
import { CartItem } from '@/types/models'
import { StockValidationPopup, useStockValidationPopup } from '@/components/ui/stock-validation-popup'
import { validateFoodStock } from '@/lib/stock-validation'

interface CartItemsProps {
  items: CartItem[]
  totalItems: number
  onChangeQuantity: (menuItemId: string, newQty: number) => void
  onRemove: (menuItemId: string) => void
}

export function CartItems({ items, totalItems, onChangeQuantity, onRemove }: CartItemsProps) {
  const { isOpen, validationResult, showValidation, hideValidation } = useStockValidationPopup()

  const handleQuantityChange = async (menuItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemove(menuItemId)
      return
    }

    // Check stock before updating quantity
    try {
      const stockValidation = await validateFoodStock(menuItemId, newQuantity)
      
      if (!stockValidation.isValid) {
        showValidation(stockValidation)
        return
      }
      
      // If stock is valid, proceed with update
      onChangeQuantity(menuItemId, newQuantity)
    } catch (error) {
      console.error('Error checking stock:', error)
      // Fallback to original method if stock check fails
      onChangeQuantity(menuItemId, newQuantity)
    }
  }

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Your Order</CardTitle>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {totalItems} items
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.menuItem.id} className="flex items-center gap-4 p-3 bg-white rounded-lg border border-orange-100">
              <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0 shadow-sm">
                <Image src={item.menuItem.image} alt={item.menuItem.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{item.menuItem.name}</h3>
                    <div className="text-xs text-gray-500">{formatPrice(item.menuItem.price)} each</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleQuantityChange(item.menuItem.id, item.quantity - 1)} className="w-7 h-7 p-0 border-orange-200 hover:bg-orange-50">
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-7 text-center font-medium text-sm tabular-nums">{item.quantity}</span>
                    <Button size="sm" variant="outline" onClick={() => handleQuantityChange(item.menuItem.id, item.quantity + 1)} className="w-7 h-7 p-0 border-orange-200 hover:bg-orange-50">
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onRemove(item.menuItem.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50" aria-label="Remove item">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="ml-auto text-right">
                <p className="font-bold text-sm text-gray-900">{formatPrice(calculatePrice(item.menuItem.price, item.quantity))}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <StockValidationPopup
        isOpen={isOpen}
        onClose={hideValidation}
        validationResult={validationResult}
      />
    </Card>
  )
}


