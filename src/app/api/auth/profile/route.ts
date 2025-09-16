import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireCustomer, createUnauthorizedResponse } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
    try {
        // Require customer role
        const authResult = requireCustomer(request)
        if (!authResult.success) {
            return createUnauthorizedResponse(authResult.error || 'Unauthorized')
        }

        const user = authResult.user!

        // Get account details
        const account = await prisma.account.findUnique({
            where: { AccountID: user.id },
            select: {
                AccountID: true,
                Email: true,
                Username: true,
                Avatar: true,
                Status: true,
                CreatedAt: true,
                UpdatedAt: true,
                role: {
                    select: {
                        RoleName: true
                    }
                }
            }
        })

        if (!account) {
            return NextResponse.json(
                { error: 'Account not found' },
                { status: 404 }
            )
        }

        // Get customer details if exists
        const customer = await prisma.customer.findUnique({
            where: { AccountID: user.id },
            select: {
                CustomerID: true,
                FullName: true,
                PhoneNumber: true,
                Address: true,
                DateOfBirth: true,
                Gender: true,
                PreferredPaymentMethod: true
            }
        })

        return NextResponse.json({
            account: {
                id: account.AccountID,
                email: account.Email,
                username: account.Username,
                avatar: account.Avatar,
                status: account.Status,
                role: account.role?.RoleName,
                createdAt: account.CreatedAt,
                updatedAt: account.UpdatedAt
            },
            customer: customer
        })
    } catch (error) {
        console.error('Get profile error:', error)
        return NextResponse.json(
            { error: 'Failed to get profile' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '')

        if (!token) {
            return NextResponse.json(
                { error: 'No token provided' },
                { status: 401 }
            )
        }

        const decoded = verifyToken(token)
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { name, phone, address } = body

        const user = await prisma.user.update({
            where: { id: decoded.userId },
            data: {
                name,
                phone,
                address,
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                address: true,
                createdAt: true,
                updatedAt: true,
            }
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error('Update profile error:', error)
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        )
    }
}
