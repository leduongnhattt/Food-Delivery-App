import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { CartItem as CartItemType } from '@/types/models'
import { StockValidationPopup, useStockValidationPopup } from '@/components/ui/stock-validation-popup'
import { validateFoodStock } from '@/lib/stock-validation'

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (menuItemId: string, quantity: number) => void
  onRemove: (menuItemId: string) => void
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { isOpen, validationResult, showValidation, hideValidation } = useStockValidationPopup()

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemove(item.menuItem.id)
      return
    }

    // Check stock before updating quantity
    try {
      const stockValidation = await validateFoodStock(item.menuItem.id, newQuantity)
      
      if (!stockValidation.isValid) {
        showValidation(stockValidation)
        return
      }
      
      // If stock is valid, proceed with update
      onUpdateQuantity(item.menuItem.id, newQuantity)
    } catch (error) {
      console.error('Error checking stock:', error)
      // Fallback to original method if stock check fails
      onUpdateQuantity(item.menuItem.id, newQuantity)
    }
  }

  return (
    <>
      <div className="grid grid-cols-[64px_1fr_auto_auto] items-center gap-4 p-4 border-b">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
          <Image
            src={item.menuItem.image}
            alt={item.menuItem.name}
            fill
            className="object-cover"
          />
        </div>
        
        <div className="min-w-0">
          <h3 className="font-medium text-sm truncate">{item.menuItem.name}</h3>
          <p className="text-sm text-muted-foreground">
            {formatPrice(item.menuItem.price)}
          </p>
          {item.specialInstructions && (
            <p className="text-xs text-muted-foreground mt-1">
              Note: {item.specialInstructions}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2 min-w-[122px] justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="w-8 h-8 p-0 rounded-md"
          >
            -
          </Button>
          <span className="w-8 text-center text-sm font-medium tabular-nums">
            {item.quantity}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="w-8 h-8 p-0 rounded-md"
          >
            +
          </Button>
        </div>
      </div>

      <StockValidationPopup
        isOpen={isOpen}
        onClose={hideValidation}
        validationResult={validationResult}
      />
    </>
  )
}
