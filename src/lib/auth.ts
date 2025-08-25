import jwt from 'jsonwebtoken'

interface TokenPayload {
    userId: string
    email: string
    iat: number
    exp: number
}

export function verifyToken(token: string): TokenPayload | null {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as TokenPayload
        return decoded
    } catch (error) {
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
