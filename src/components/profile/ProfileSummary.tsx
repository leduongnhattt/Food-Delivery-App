import { Button } from '@/components/ui/button'
import { Camera, Edit } from 'lucide-react'

interface ProfileSummaryProps {
  fullName: string
  email: string
  isEditing: boolean
  onEdit: () => void
}

export function ProfileSummary({ fullName, email, isEditing, onEdit }: ProfileSummaryProps) {
  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-3xl font-bold border border-gray-300">
          {fullName.charAt(0).toUpperCase()}
        </div>
        <Button size="sm" className="absolute -bottom-2 -right-2 bg-orange-600 hover:bg-orange-700 rounded-full w-9 h-9 p-0 text-white">
          <Camera className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-lg font-semibold text-gray-900 truncate">{fullName}</div>
        <div className="text-gray-600 truncate">{email}</div>
      </div>
      {!isEditing && (
        <Button onClick={onEdit} className="bg-orange-600 hover:bg-orange-700 text-white">
          <Edit className="w-4 h-4 mr-2" />Edit
        </Button>
      )}
    </div>
  )
}

