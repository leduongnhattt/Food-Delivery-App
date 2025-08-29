'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/use-cart'
import { CartSidebar } from '@/components/cart/cart-sidebar'
import { useRouter } from 'next/navigation';


export function Header() {
  const router = useRouter();
  const { getTotalItems, openCart, closeCart, isOpen, cartItems, updateQuantity, removeFromCart } = useCart()

  const handleSignInSite = () => {
    router.push("/signin")
  }
  const handleSignUpSite = () => {
    router.push("/signup")
  }
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 text-orange-500 flex items-center space-x-2">
              <span className="font-bold text-xl">Hanala Food</span>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
            <Link href="/restaurants" className="transition-colors hover:text-foreground/80">
              Restaurants
            </Link>
            <Link href="/orders" className="transition-colors hover:text-foreground/80">
              My Orders
            </Link>
            <Link href="/about" className="transition-colors hover:text-foreground/80">
              About
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={openCart}
              className="relative"
            >
              🛒 Cart
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Button>
            <Button variant="outline" size="sm"
              onClick={handleSignInSite}
            >
              Sign In
            </Button>
            <Button variant="outline" size="sm"
              onClick={handleSignUpSite}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      <CartSidebar
        isOpen={isOpen}
        onClose={closeCart}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={() => {
          closeCart()
          // Navigate to checkout page
          window.location.href = '/checkout'
        }}
      />
    </>
  )
}
