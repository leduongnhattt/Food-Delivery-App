import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Delicious Food Delivered to Your Doorstep
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Order from the best restaurants in Ho Chi Minh City. Fast delivery, 
            great prices, and amazing food - all at your fingertips.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/restaurants">
              <Button size="lg" variant="secondary">
                Browse Restaurants
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-orange-500">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

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
