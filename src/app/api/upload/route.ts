import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

const MAX_SIZE_MB = parseInt(process.env.MAX_UPLOAD_SIZE_MB ?? '5')
const MAX_SIZE    = MAX_SIZE_MB * 1024 * 1024

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'image/svg+xml',
]

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const formData = await req.formData()
  const file     = formData.get('file') as File | null
  const folder   = (formData.get('folder') as string) ?? 'general'

  if (!file) return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: `Fichier trop volumineux (max ${MAX_SIZE_MB}Mo)` }, { status: 400 })
  }

  const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const filename = `${randomUUID()}.${ext}`
  const uploadDir = join(process.cwd(), 'public', 'uploads', folder)

  await mkdir(uploadDir, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(join(uploadDir, filename), buffer)

  const url = `/uploads/${folder}/${filename}`

  const media = await prisma.media.create({
    data: {
      filename,
      url,
      mimeType: file.type,
      size:     file.size,
      folder,
      alt:      file.name.replace(/\.[^.]+$/, ''),
    },
  })

  return NextResponse.json(media, { status: 201 })
}
