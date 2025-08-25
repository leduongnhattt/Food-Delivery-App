import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password, name, phone, address } = body

        // Validate required fields
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Email, password, and name are required' },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists with this email' },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create new user
        const user = await prisma.user.create({
            data: {
                email,
                name,
                phone,
                address,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                address: true,
                createdAt: true,
            }
        })

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        )

        return NextResponse.json({
            user,
            token
        }, { status: 201 })
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'Registration failed' },
            { status: 500 }
        )
    }
}
