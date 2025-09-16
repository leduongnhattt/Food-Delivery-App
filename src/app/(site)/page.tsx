'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import HeroSection from '@/components/landingpage/HeroSection'
import FoodsSlideMenu from '@/components/landingpage/FoodsSlideMenu'
import RestaurantMenu from '@/components/landingpage/RestaurantMenu'

export default function HomePage() {
  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Implement search logic here
  };
  const handleOrderFood = (foodId: string) => {
    console.log('Ordering:', foodId);
    // Implement order logic
  };
  return (
    <div>
      {/* Hero Section */}
      <HeroSection 
        onSearch={handleSearch}
        placeholder="Enter your favorite food..."
      />

      <FoodsSlideMenu
        title="Popular Foods"
        onOrderFood={handleOrderFood}
        foods={[]}
        className='my-8 mr-4 ml-4'
        // You can pass foods data and onOrderFood handler as props
      />

      <RestaurantMenu
        className='my-8 mr-4 ml-4'
        // You can pass restaurants 
      />

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose FoodieExpress?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <CardTitle>Fast Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get your food delivered in 30-45 minutes on average. 
                  We prioritize speed without compromising on quality.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🍽️</span>
                </div>
                <CardTitle>Quality Restaurants</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Partner with the best restaurants in the city. 
                  From local favorites to international cuisine.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <CardTitle>Easy Ordering</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Simple and intuitive ordering process. 
                  Track your order in real-time from kitchen to doorstep.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Popular Food Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Pizza', icon: '🍕', color: 'bg-red-100' },
              { name: 'Sushi', icon: '🍣', color: 'bg-blue-100' },
              { name: 'Pho', icon: '🍜', color: 'bg-orange-100' },
              { name: 'Burgers', icon: '🍔', color: 'bg-yellow-100' },
              { name: 'Salads', icon: '🥗', color: 'bg-green-100' },
              { name: 'Desserts', icon: '🍰', color: 'bg-pink-100' },
              { name: 'Drinks', icon: '🥤', color: 'bg-purple-100' },
              { name: 'Coffee', icon: '☕', color: 'bg-brown-100' },
            ].map((category) => (
              <Card key={category.name} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <h3 className="font-semibold">{category.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-orange-500 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Order Delicious Food?
          </h2>
          <p className="text-xl mb-8">
            Join thousands of satisfied customers who choose FoodieExpress for their food delivery needs.
          </p>
          <Link href="/restaurants">
            <Button size="lg" variant="secondary">
              Start Ordering Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
