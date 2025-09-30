import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
    try {
        const auth = getAuthenticatedUser(request)
        if (!auth.success || !auth.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const form = await request.formData()
        const file = form.get('file') as File | null
        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        // Validate mime type (allow jpeg/png/webp only)
        const allowed = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowed.includes(file.type)) {
            return NextResponse.json({ error: 'Only JPEG, PNG, WEBP images are allowed' }, { status: 400 })
        }

        // Limit ~3MB
        const maxBytes = 3 * 1024 * 1024
        if (file.size > maxBytes) {
            return NextResponse.json({ error: 'File too large (max 3MB)' }, { status: 413 })
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload to Cloudinary (signed upload)
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME
        const apiKey = process.env.CLOUDINARY_API_KEY
        const apiSecret = process.env.CLOUDINARY_API_SECRET
        const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'hanala/avatars'
        if (!cloudName || !apiKey || !apiSecret) {
            return NextResponse.json({ error: 'Cloudinary is not configured' }, { status: 500 })
        }

        const timestamp = Math.floor(Date.now() / 1000)
        const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
        const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex')

        const formData = new FormData()
        formData.append('file', `data:${file.type};base64,${buffer.toString('base64')}`)
        formData.append('api_key', apiKey)
        formData.append('timestamp', String(timestamp))
        formData.append('signature', signature)
        formData.append('folder', folder)

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        })
        if (!uploadRes.ok) {
            const errText = await uploadRes.text()
            console.error('Cloudinary error:', errText)
            return NextResponse.json({ error: 'Upload to cloud failed' }, { status: 502 })
        }
        const uploaded = await uploadRes.json() as { secure_url?: string }
        const publicUrl = uploaded.secure_url
        if (!publicUrl) {
            return NextResponse.json({ error: 'Cloud upload missing URL' }, { status: 502 })
        }

        await prisma.account.update({
            where: { AccountID: auth.user.id },
            data: { Avatar: publicUrl }
        })

        return NextResponse.json({ success: true, url: publicUrl })
    } catch (err) {
        console.error('Avatar upload failed:', err)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}


