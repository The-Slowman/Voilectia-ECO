import { z } from 'zod'
import { NextResponse } from 'next/server'

/** Parse le body JSON avec un schema Zod. Retourne { data } ou { error: NextResponse }. */
export async function parseBody<T>(
  req: Request,
  schema: z.ZodType<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const raw = await req.json()
    const result = schema.safeParse(raw)
    if (!result.success) {
      const message = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { data: null, error: NextResponse.json({ error: `Validation: ${message}` }, { status: 400 }) }
    }
    return { data: result.data, error: null }
  } catch {
    return { data: null, error: NextResponse.json({ error: 'JSON invalide.' }, { status: 400 }) }
  }
}

// ── Schemas communs ─────────────────────────────────────────────

export const serverConfigSchema = z.object({
  worldSize:   z.string().max(60).optional(),
  difficulty:  z.string().max(60).optional(),
  xpRate:      z.string().max(60).optional(),
  specialties: z.number().int().min(1).max(50).optional(),
  currency:    z.string().max(20).optional(),
  season:      z.string().max(20).optional(),
  status:      z.enum(['preparation', 'open', 'closed', 'maintenance']).optional(),
  serverIp:    z.string().max(120).optional().nullable(),
  serverPort:  z.string().max(10).optional().nullable(),
  ecoVersion:  z.string().max(40).optional().nullable(),
  maxPlayers:  z.number().int().min(1).max(1000).optional().nullable(),
  modpack:     z.string().max(100).optional().nullable(),
  discordUrl:     z.string().max(300).optional().nullable(),
  topServeurUrl:  z.string().max(300).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  startDate:   z.string().optional().nullable(),
  endDate:     z.string().optional().nullable(),
})

export const jobProgressionSchema = z.object({
  jobName:    z.string().min(1).max(80),
  unlockDay:  z.number().int().min(1).max(365),
  description: z.string().max(500).optional().nullable(),
  icon:        z.string().max(10).optional().nullable(),
  color:       z.string().max(20).optional(),
  order:       z.number().int().optional(),
})

export const giveawaySchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  prize:       z.string().min(1).max(500),
  image:       z.string().url().optional().nullable(),
  endDate:     z.string().datetime(),
  published:   z.boolean().optional(),
})

export const giveawayEntrySchema = z.object({
  playerName: z.string().min(1).max(80),
  discordTag: z.string().max(100).optional().nullable(),
  email:      z.string().email().optional().nullable(),
})

export const articleSchema = z.object({
  title:      z.string().min(1).max(300),
  slug:       z.string().min(1).max(300).optional(),
  excerpt:    z.string().max(1000).optional().nullable(),
  content:    z.string().min(1),
  coverImage: z.string().url().optional().nullable(),
  category:   z.enum(['news', 'announcement', 'update']).optional(),
  published:  z.boolean().optional(),
  pinned:     z.boolean().optional(),
  metaTitle:  z.string().max(200).optional().nullable(),
  metaDesc:   z.string().max(500).optional().nullable(),
})

export const staffSchema = z.object({
  name:        z.string().min(1).max(80),
  role:        z.string().min(1).max(80),
  description: z.string().max(500).optional().nullable(),
  avatar:      z.string().url().optional().nullable().or(z.literal('')),
  discordId:   z.string().max(100).optional().nullable(),
  order:       z.number().int().optional(),
  active:      z.boolean().optional(),
})

export const playerRegisterSchema = z.object({
  username:   z.string().min(2).max(30).regex(/^[a-zA-Z0-9_\-\.]+$/, 'Pseudo invalide'),
  email:      z.string().email(),
  password:   z.string().min(8).max(100),
  ecoName:    z.string().max(50).optional().nullable(),
  discordTag: z.string().max(50).optional().nullable(),
})

export const playerLoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})
