import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { CartItem as CartItemType } from '@/types'

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (menuItemId: string, quantity: number) => void
  onRemove: (menuItemId: string) => void
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemove(item.menuItem.id)
    } else {
      onUpdateQuantity(item.menuItem.id, newQuantity)
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={item.menuItem.image}
          alt={item.menuItem.name}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="flex-1 min-w-0">
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
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(item.quantity - 1)}
          className="w-8 h-8 p-0"
        >
          -
        </Button>
        <span className="w-8 text-center text-sm font-medium">
          {item.quantity}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(item.quantity + 1)}
          className="w-8 h-8 p-0"
        >
          +
        </Button>
      </div>
      
      <div className="text-right">
        <p className="font-medium text-sm">
          {formatPrice(item.menuItem.price * item.quantity)}
        </p>
      </div>
    </div>
  )
}
