import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ChangePasswordCardProps {
  onChangePassword: () => void
}

export function ChangePasswordCard({ onChangePassword }: ChangePasswordCardProps) {
  return (
    <Card className="mt-6 shadow-sm border border-gray-200 bg-white rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-gray-900">Change Password</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-gray-600">
          Change your password securely. We will send a verification code to your email first.
        </p>
        <Button
          className="bg-orange-600 hover:bg-orange-700 text-white"
          onClick={onChangePassword}
        >
          Change Password
        </Button>
      </CardContent>
    </Card>
  )
}

