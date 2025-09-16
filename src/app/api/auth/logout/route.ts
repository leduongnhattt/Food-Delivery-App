import { NextRequest, NextResponse } from 'next/server'
import { revokeRefreshToken } from '@/services/auth.service'

export async function POST(request: NextRequest) {
    try {
        const refresh = request.cookies.get('refresh_token')?.value
        const accountId = request.headers.get('x-account-id') || ''
        if (refresh && accountId) {
            await revokeRefreshToken(accountId, refresh)
        }
        const res = NextResponse.json({ success: true }, { status: 200 })
        res.cookies.set('refresh_token', '', { httpOnly: true, expires: new Date(0) })
        return res
    } catch {
        return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
    }
}



