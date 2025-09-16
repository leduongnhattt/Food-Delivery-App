import jwt from 'jsonwebtoken'

interface TokenPayload {
    accountId: string
    role: string
    username?: string
    email?: string
    status?: string
    userId?: string // For backward compatibility
    iat: number
    exp: number
}

export function verifyToken(token: string): TokenPayload | null {
    try {
        // Check if token is valid format
        if (!token || typeof token !== 'string' || token.trim() === '') {
            return null
        }

        // Check if token has proper JWT format (3 parts separated by dots)
        const parts = token.split('.')
        if (parts.length !== 3) {
            return null
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as TokenPayload
        return decoded
    } catch (error) {
        // Don't log malformed token errors to avoid spam
        if (error instanceof jwt.JsonWebTokenError) {
            return null
        }
        console.error('Token verification failed:', error)
        return null
    }
}

export function generateToken(payload: { userId: string; email: string }): string {
    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' })
}

export function hashPassword(password: string): Promise<string> {
    const bcrypt = require('bcryptjs')
    return bcrypt.hash(password, 12)
}

export function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    const bcrypt = require('bcryptjs')
    return bcrypt.compare(password, hashedPassword)
}
