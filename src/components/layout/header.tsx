'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'
import { CartSidebar } from '@/components/cart/cart-sidebar'
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react'
import { UserMenu } from '@/components/layout/user-menu'


export function Header() {
  const router = useRouter();
  const { getTotalItems, openCart, closeCart, isOpen, cartItems, updateQuantity, removeFromCart } = useCart()
  const { isAuthenticated, user, isLoading, logout } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement | null>(null)

  const handleSignInSite = () => {
    router.push("/signin")
  }
  const handleSignUpSite = () => {
    router.push("/signup")
  }
  const handleLogout = () => {
    logout()
  }
  const handleProfile = () => {
    setIsProfileOpen(false)
    router.push('/profile')
  }
  const handleSettings = () => {
    setIsProfileOpen(false)
    router.push('/settings')
  }

  // Close profile popup on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!isProfileOpen) return
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [isProfileOpen])
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
            
            {/* Authentication buttons */}
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <UserMenu user={user} onLogout={handleLogout} />
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSignInSite}
                      className="rounded-md border-gray-300 text-gray-900 hover:bg-gray-100 gap-2"
                    >
                      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                        <polyline points="10 17 15 12 10 7"/>
                        <line x1="15" y1="12" x2="3" y2="12"/>
                      </svg>
                      <span>Sign In</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSignUpSite}
                      className="rounded-md bg-orange-600 text-white border-transparent hover:bg-orange-700 gap-2"
                    >
                      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                        <line x1="19" y1="8" x2="19" y2="14"/>
                        <line x1="22" y1="11" x2="16" y2="11"/>
                      </svg>
                      <span>Sign Up</span>
                    </Button>
                  </>
                )}
              </>
            )}
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
