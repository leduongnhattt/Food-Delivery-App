import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Eye, EyeOff } from 'lucide-react'

interface ChangePasswordModalProps {
  isOpen: boolean
  canEditPassword: boolean
  currentPassword: string
  newPassword: string
  confirmPassword: string
  showCurrent: boolean
  showNew: boolean
  showConfirm: boolean
  pwdError: string | null
  onClose: () => void
  onCurrentPasswordChange: (value: string) => void
  onNewPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onToggleCurrentVisibility: () => void
  onToggleNewVisibility: () => void
  onToggleConfirmVisibility: () => void
  onUpdatePassword: () => void
}

export function ChangePasswordModal({
  isOpen,
  canEditPassword,
  currentPassword,
  newPassword,
  confirmPassword,
  showCurrent,
  showNew,
  showConfirm,
  pwdError,
  onClose,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onToggleCurrentVisibility,
  onToggleNewVisibility,
  onToggleConfirmVisibility,
  onUpdatePassword
}: ChangePasswordModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Change Password</h3>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-4 space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium mb-2 text-gray-700">Current Password</label>
            <Input
              disabled={!canEditPassword}
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => onCurrentPasswordChange(e.target.value)}
              className="border-gray-300 focus:border-orange-600 focus:ring-orange-600 h-11 rounded-lg disabled:bg-gray-100 pr-10"
            />
            <button type="button" className="absolute right-3 top-[38px] text-gray-500" onClick={onToggleCurrentVisibility}>
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium mb-2 text-gray-700">New Password</label>
            <Input
              disabled={!canEditPassword}
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
              className="border-gray-300 focus:border-orange-600 focus:ring-orange-600 h-11 rounded-lg disabled:bg-gray-100 pr-10"
            />
            <button type="button" className="absolute right-3 top-[38px] text-gray-500" onClick={onToggleNewVisibility}>
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium mb-2 text-gray-700">Confirm New Password</label>
            <Input
              disabled={!canEditPassword}
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              className="border-gray-300 focus:border-orange-600 focus:ring-orange-600 h-11 rounded-lg disabled:bg-gray-100 pr-10"
            />
            <button type="button" className="absolute right-3 top-[38px] text-gray-500" onClick={onToggleConfirmVisibility}>
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {pwdError && <div className="text-sm text-red-600">{pwdError}</div>}
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              disabled={!canEditPassword}
              className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
              onClick={onUpdatePassword}
            >
              Update Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

