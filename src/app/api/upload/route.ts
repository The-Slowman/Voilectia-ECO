import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join, basename } from 'path'
import { randomUUID } from 'crypto'

const MAX_SIZE_MB = parseInt(process.env.MAX_UPLOAD_SIZE_MB ?? '5')
const MAX_SIZE    = MAX_SIZE_MB * 1024 * 1024

// Extensions et types MIME autorisés (sans SVG — risque XSS)
const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg':  'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
}

// Magic bytes pour vérification MIME réelle (non spoofable)
const MAGIC_BYTES: Array<{ mime: string; bytes: number[]; offset?: number }> = [
  // JPEG: FF D8 FF
  { mime: 'image/jpeg', bytes: [0xFF, 0xD8, 0xFF] },
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  { mime: 'image/png',  bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] },
  // WebP: RIFF....WEBP
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 },
  // GIF87a / GIF89a
  { mime: 'image/gif',  bytes: [0x47, 0x49, 0x46, 0x38] },
]

function detectMimeFromBuffer(buf: Buffer): string | null {
  for (const sig of MAGIC_BYTES) {
    const offset = sig.offset ?? 0
    const match = sig.bytes.every((byte, i) => buf[offset + i] === byte)
    if (match) {
      // WebP supplémentaire : vérifier "WEBP" aux octets 8-11
      if (sig.mime === 'image/webp') {
        const isWebP = buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
        if (!isWebP) continue
      }
      return sig.mime
    }
  }
  return null
}

// Dossiers autorisés (empêche path traversal)
const ALLOWED_FOLDERS = new Set(['general', 'articles', 'cities', 'events', 'guides', 'staff', 'giveaways', 'avatars'])

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const formData = await req.formData()
  const file     = formData.get('file') as File | null
  const rawFolder = (formData.get('folder') as string) ?? 'general'

  if (!file) return NextResponse.json({ error: 'Aucun fichier fourni.' }, { status: 400 })

  // Sanitiser le nom du dossier (empêcher path traversal)
  const folder = basename(rawFolder).replace(/[^a-z0-9_-]/gi, '')
  if (!ALLOWED_FOLDERS.has(folder)) {
    return NextResponse.json({ error: `Dossier non autorisé. Dossiers valides : ${[...ALLOWED_FOLDERS].join(', ')}.` }, { status: 400 })
  }

  // Vérification taille
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: `Fichier trop volumineux (max ${MAX_SIZE_MB} Mo).` }, { status: 400 })
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'Fichier vide.' }, { status: 400 })
  }

  // Lecture des premiers octets pour vérification MIME réelle
  const buffer = Buffer.from(await file.arrayBuffer())
  const realMime = detectMimeFromBuffer(buffer)

  if (!realMime || !ALLOWED_MIME[realMime]) {
    return NextResponse.json(
      { error: 'Format non autorisé. Seuls JPEG, PNG, WebP et GIF sont acceptés.' },
      { status: 400 }
    )
  }

  // Vérifier cohérence entre type déclaré et type réel
  const declaredMime = file.type.toLowerCase().split(';')[0].trim()
  if (declaredMime !== realMime && !(declaredMime === 'image/jpg' && realMime === 'image/jpeg')) {
    return NextResponse.json(
      { error: 'Le type de fichier ne correspond pas à son contenu réel.' },
      { status: 400 }
    )
  }

  const ext      = ALLOWED_MIME[realMime]
  const filename = `${randomUUID()}.${ext}`
  const uploadDir = join(process.cwd(), 'public', 'uploads', folder)

  try {
    await mkdir(uploadDir, { recursive: true })
    await writeFile(join(uploadDir, filename), buffer)
  } catch (err) {
    console.error('[upload] Erreur écriture fichier', err)
    return NextResponse.json({ error: 'Erreur lors de l\'enregistrement du fichier.' }, { status: 500 })
  }

  const url = `/uploads/${folder}/${filename}`

  const media = await prisma.media.create({
    data: {
      filename,
      url,
      mimeType: realMime,
      size:     file.size,
      folder,
      alt:      file.name.replace(/\.[^.]+$/, '').slice(0, 255),
    },
  })

  return NextResponse.json(media, { status: 201 })
}
