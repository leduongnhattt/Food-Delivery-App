import { NextRequest, NextResponse } from 'next/server'
import { rotateAccessTokenFromRefresh } from '@/services/auth.service'

export async function POST(request: NextRequest) {
    try {
        const refresh = request.cookies.get('refresh_token')?.value
        const accountId = request.headers.get('x-account-id') || ''
        if (!refresh || !accountId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const accessToken = await rotateAccessTokenFromRefresh(accountId, refresh)
        if (!accessToken) return NextResponse.json({ error: 'Invalid refresh' }, { status: 401 })

        return NextResponse.json({ accessToken }, { status: 200 })
    } catch {
        return NextResponse.json({ error: 'Refresh failed' }, { status: 500 })
    }
}



