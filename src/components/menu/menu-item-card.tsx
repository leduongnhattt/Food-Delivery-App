import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { MenuItem } from '@/types'

interface MenuItemCardProps {
  menuItem: MenuItem
  onAddToCart: (menuItem: MenuItem) => void
}

export function MenuItemCard({ menuItem, onAddToCart }: MenuItemCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-40 w-full">
        <Image
          src={menuItem.image}
          alt={menuItem.name}
          fill
          className="object-cover"
        />
        {!menuItem.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{menuItem.name}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {menuItem.description}
        </p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">
            {formatPrice(menuItem.price)}
          </span>
          <Button
            size="sm"
            onClick={() => onAddToCart(menuItem)}
            disabled={!menuItem.isAvailable}
          >
            {menuItem.isAvailable ? 'Add to Cart' : 'Unavailable'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
