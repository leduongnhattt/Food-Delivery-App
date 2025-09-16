import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/schemas/auth'
import { createAccount, hashPassword } from '@/services/auth.service'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const json = await request.json()
        const parsed = registerSchema.safeParse(json)
        if (!parsed.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: parsed.error.flatten()
            }, { status: 400 })
        }

        const { username, email, password } = parsed.data

        // Check if username or email already exists
        const exists = await prisma.account.findFirst({
            where: { OR: [{ Email: email }, { Username: username }] },
            select: { AccountID: true, Email: true, Username: true }
        })
        if (exists) {
            const field = exists.Email === email ? 'email' : 'username'
            return NextResponse.json({
                error: `${field} already exists`,
                field: field
            }, { status: 400 })
        }

        // Hash password and create account with customer record
        const passwordHash = await hashPassword(password)
        const account = await createAccount({ username, email, passwordHash })

        return NextResponse.json({
            success: true,
            message: 'Registration successful',
            account: {
                id: account.AccountID,
                username: account.Username,
                email: account.Email,
                role: account.role?.RoleName,
                status: account.Status,
                customer: account.customer
            }
        }, { status: 201 })
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json({
            error: 'Registration failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
