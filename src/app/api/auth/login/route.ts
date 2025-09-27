import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/schemas/auth'
import { findAccountByUsername, verifyPassword, issueTokens } from '@/services/auth.service'

function setRefreshCookie(res: NextResponse, token: string, expires: Date) {
    res.cookies.set('refresh_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        expires
    })
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { username, password } = body

        // Validate required fields
        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            )
        }

        // Find account by username
        const account = await findAccountByUsername(username)

        if (!account) {
            return NextResponse.json(
                { error: 'Username does not exist. Please check your username or create a new account.' },
                { status: 401 }
            )
        }

        // Check password
        const isPasswordValid = await verifyPassword(password, account.PasswordHash)

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Incorrect password. Please check your password and try again.' },
                { status: 401 }
            )
        }

        // Issue tokens
        const { accessToken, refreshToken, expiredAt } = await issueTokens(
            account.AccountID,
            account.role?.RoleName || 'customer'
        )

        // Create response
        const response = NextResponse.json({
            success: true,
            user: {
                id: account.AccountID,
                username: account.Username,
                email: account.Email,
                role: account.role?.RoleName || 'customer',
                status: account.Status
            },
            accessToken
        })

        // Set refresh token cookie
        setRefreshCookie(response, refreshToken, expiredAt)

        return response
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Login failed' },
            { status: 500 }
        )
    }
}
