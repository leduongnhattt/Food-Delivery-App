import { useState, useEffect } from 'react'
import { PasswordService } from '@/services/password.service'

export interface PasswordChangeState {
    isCodeModalOpen: boolean
    isChangePwdModalOpen: boolean
    canEditPassword: boolean
    code: string
    codeError: string | null
    sending: boolean
    resendIn: number
    currentPassword: string
    newPassword: string
    confirmPassword: string
    pwdError: string | null
    showCurrent: boolean
    showNew: boolean
    showConfirm: boolean
    resetTokenId: string | null
}

export function usePasswordChange(email: string) {
    const [state, setState] = useState<PasswordChangeState>({
        isCodeModalOpen: false,
        isChangePwdModalOpen: false,
        canEditPassword: false,
        code: '',
        codeError: null,
        sending: false,
        resendIn: 0,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        pwdError: null,
        showCurrent: false,
        showNew: false,
        showConfirm: false,
        resetTokenId: null
    })

    // Start 60s cooldown whenever the code modal opens
    useEffect(() => {
        if (!state.isCodeModalOpen) return

        setState(prev => ({ ...prev, resendIn: 60 }))
        const timer = setInterval(() => {
            setState(prev => ({ ...prev, resendIn: prev.resendIn > 0 ? prev.resendIn - 1 : 0 }))
        }, 1000)

        return () => clearInterval(timer)
    }, [state.isCodeModalOpen])

    // Update state helper
    const updateState = (updates: Partial<PasswordChangeState>) => {
        setState(prev => ({ ...prev, ...updates }))
    }

    // Start password change process
    const startPasswordChange = async () => {
        updateState({
            isChangePwdModalOpen: true,
            canEditPassword: false,
            code: '',
            codeError: null,
            sending: true
        })

        try {
            const result = await PasswordService.sendResetCode(email)
            if (!result.success) {
                throw new Error(result.error || 'Failed to send code')
            }

            // Auto transition to code modal
            setTimeout(() => {
                updateState({
                    isChangePwdModalOpen: false,
                    isCodeModalOpen: true
                })
            }, 1500)
        } catch (error) {
            console.error('Failed to send reset code:', error)
        } finally {
            updateState({ sending: false })
        }
    }

    // Handle code change
    const handleCodeChange = (value: string) => {
        updateState({ code: value, codeError: null })
    }

    // Verify code
    const verifyCode = async () => {
        if (!state.code || state.code.length !== 6) {
            updateState({ codeError: 'Invalid code' })
            return false
        }

        try {
            const result = await PasswordService.verifyResetCode(email, state.code)

            if (!result.success) {
                updateState({ codeError: result.error || 'Verification failed' })
                return false
            }

            updateState({
                resetTokenId: result.tokenId || null,
                isCodeModalOpen: false,
                canEditPassword: true,
                isChangePwdModalOpen: true
            })

            return true
        } catch (error) {
            console.error('Verification failed:', error)
            updateState({ codeError: 'Verification failed' })
            return false
        }
    }

    // Resend code
    const resendCode = async () => {
        updateState({ sending: true })

        try {
            const result = await PasswordService.resendResetCode(email)

            if (result.success) {
                updateState({ resendIn: 60 })
            } else {
                throw new Error(result.error || 'Failed to resend code')
            }
        } catch (error) {
            console.error('Failed to resend code:', error)
        } finally {
            updateState({ sending: false })
        }
    }

    // Update password
    const updatePassword = async () => {
        updateState({ pwdError: null })

        // Validation
        if (!state.currentPassword || !state.newPassword || !state.confirmPassword) {
            updateState({ pwdError: 'Please fill in all fields' })
            return false
        }

        if (state.newPassword.length < 6) {
            updateState({ pwdError: 'New password must be at least 6 characters' })
            return false
        }

        if (state.newPassword !== state.confirmPassword) {
            updateState({ pwdError: 'New password and confirmation do not match' })
            return false
        }

        if (!state.resetTokenId) {
            updateState({ pwdError: 'Verification required' })
            return false
        }

        try {
            const result = await PasswordService.resetPassword(state.resetTokenId, state.newPassword)

            if (!result.success) {
                updateState({ pwdError: result.error || 'Failed to update password' })
                return false
            }

            // Success - reset form and close modal
            updateState({
                isChangePwdModalOpen: false,
                resetTokenId: null,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            })

            return true
        } catch (error) {
            console.error('Failed to update password:', error)
            updateState({ pwdError: 'Failed to update password' })
            return false
        }
    }

    // Close modals
    const closeCodeModal = () => {
        updateState({
            isCodeModalOpen: false,
            isChangePwdModalOpen: false
        })
    }

    const closePasswordModal = () => {
        updateState({ isChangePwdModalOpen: false })
    }

    // Toggle password visibility
    const toggleCurrentVisibility = () => {
        updateState({ showCurrent: !state.showCurrent })
    }

    const toggleNewVisibility = () => {
        updateState({ showNew: !state.showNew })
    }

    const toggleConfirmVisibility = () => {
        updateState({ showConfirm: !state.showConfirm })
    }

    return {
        state,
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
    }
}
