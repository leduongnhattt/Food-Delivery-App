'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/auth-guard'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileSummary } from '@/components/profile/ProfileSummary'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { ChangePasswordCard } from '@/components/profile/ChangePasswordCard'
import { VerifyCodeModal } from '@/components/profile/VerifyCodeModal'
import { ChangePasswordModal } from '@/components/profile/ChangePasswordModal'
import { NotificationToast } from '@/components/profile/NotificationToast'
import { useProfileData } from '@/hooks/use-profile-data'
import { usePasswordChange } from '@/hooks/use-password-change'

export default function ProfilePage() {
  const router = useRouter()
  
  // Custom hooks for state management
  const {
    profileData,
    isEditing,
    notification,
    setIsEditing,
    updateField,
    saveProfile,
    clearNotification
  } = useProfileData()

  const {
    state: passwordState,
    startPasswordChange,
    handleCodeChange,
    verifyCode,
    resendCode,
    updatePassword,
    closeCodeModal,
    closePasswordModal,
    toggleCurrentVisibility,
    toggleNewVisibility,
    toggleConfirmVisibility,
    updateState
  } = usePasswordChange(profileData.email)

  // Handler functions using hooks
  const handleFieldChange = (field: string, value: string) => {
    updateField(field as keyof typeof profileData, value)
  }

  const handleSaveProfile = async () => {
    await saveProfile()
  }

  const handleChangePassword = async () => {
    await startPasswordChange()
  }

  const handleVerifyCode = async () => {
    await verifyCode()
  }

  const handleResendCode = async () => {
    await resendCode()
  }

  const handleUpdatePassword = async () => {
    const success = await updatePassword()
    if (success) {
      // Handle success notification
      console.log('Password updated successfully')
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="container py-8">
          <div className="max-w-5xl mx-auto">
            <NotificationToast 
              notification={notification} 
              onClose={clearNotification} 
            />
            
            <ProfileHeader onBack={() => router.back()} />

            {/* Profile content */}
            <Card className="shadow-sm border border-gray-200 bg-white rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-gray-900">Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <ProfileSummary 
                  fullName={profileData.fullName}
                  email={profileData.email}
                  isEditing={isEditing}
                  onEdit={() => setIsEditing(true)}
                  avatarUrl={profileData.avatar}
                />

                <ProfileForm 
                  profileData={profileData}
                  isEditing={isEditing}
                  onFieldChange={handleFieldChange}
                  onSave={handleSaveProfile}
                  onCancel={() => setIsEditing(false)}
                />
              </CardContent>
            </Card>

            <ChangePasswordCard 
              onChangePassword={handleChangePassword}
            />

            <VerifyCodeModal
              isOpen={passwordState.isCodeModalOpen}
              email={profileData.email}
              code={passwordState.code}
              codeError={passwordState.codeError}
              sending={passwordState.sending}
              resendIn={passwordState.resendIn}
              onClose={closeCodeModal}
              onCodeChange={handleCodeChange}
              onVerify={handleVerifyCode}
              onResend={handleResendCode}
            />

            <ChangePasswordModal
              isOpen={passwordState.isChangePwdModalOpen}
              canEditPassword={passwordState.canEditPassword}
              currentPassword={passwordState.currentPassword}
              newPassword={passwordState.newPassword}
              confirmPassword={passwordState.confirmPassword}
              showCurrent={passwordState.showCurrent}
              showNew={passwordState.showNew}
              showConfirm={passwordState.showConfirm}
              pwdError={passwordState.pwdError}
              onClose={closePasswordModal}
              onCurrentPasswordChange={(value) => updateState({ currentPassword: value })}
              onNewPasswordChange={(value) => updateState({ newPassword: value })}
              onConfirmPasswordChange={(value) => updateState({ confirmPassword: value })}
              onToggleCurrentVisibility={toggleCurrentVisibility}
              onToggleNewVisibility={toggleNewVisibility}
              onToggleConfirmVisibility={toggleConfirmVisibility}
              onUpdatePassword={handleUpdatePassword}
            />
        </div>
      </div>
    </div>
    </AuthGuard>
  )
}
