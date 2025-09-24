"use client"
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Star, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  name: string
  description: string
  avatarUrl: string
  rating: number
  isOpen: boolean
}

export default function EnterpriseHero({ name, description, avatarUrl, rating, isOpen }: Props) {
  return (
    <div className="relative h-80 md:h-96 overflow-hidden">
      <Image src={avatarUrl} alt={name} fill className="object-cover" priority />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute top-4 right-4 flex gap-2">
        <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
          <Heart className="w-4 h-4" />
        </Button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className={isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
              {isOpen ? 'Open' : 'Closed'}
            </Badge>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{rating}</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{name}</h1>
          <p className="text-gray-200 text-sm md:text-base line-clamp-2">{description}</p>
        </div>
      </div>
    </div>
  )
}


