/**
 * Steam OpenID 2.0 — implémentation légère sans dépendance externe.
 * Référence : https://partner.steamgames.com/doc/features/auth#website
 */

const STEAM_OPENID_URL  = 'https://steamcommunity.com/openid/login'
const STEAM_API_URL     = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/'
const STEAM_ID_REGEX    = /https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})/

export interface SteamUser {
  steamId:    string
  username:   string
  avatar:     string
  profileUrl: string
}

/**
 * Construit l'URL de redirection vers Steam OpenID.
 */
export function buildSteamAuthUrl(returnTo: string, realm: string): string {
  const params = new URLSearchParams({
    'openid.ns':       'http://specs.openid.net/auth/2.0',
    'openid.mode':     'checkid_setup',
    'openid.return_to': returnTo,
    'openid.realm':    realm,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id':'http://specs.openid.net/auth/2.0/identifier_select',
  })
  return `${STEAM_OPENID_URL}?${params.toString()}`
}

/**
 * Extrait le Steam64 ID depuis le claimed_id retourné par Steam.
 */
export function extractSteamId(claimedId: string): string | null {
  const match = claimedId.match(STEAM_ID_REGEX)
  return match?.[1] ?? null
}

/**
 * Vérifie la réponse OpenID auprès de Steam (mode=check_authentication).
 * Renvoie true si la signature est valide.
 */
export async function verifySteamCallback(params: URLSearchParams): Promise<boolean> {
  const verifyParams = new URLSearchParams(params)
  verifyParams.set('openid.mode', 'check_authentication')

  try {
    const response = await fetch(STEAM_OPENID_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    verifyParams.toString(),
      signal:  AbortSignal.timeout(10_000),
    })
    const text = await response.text()
    const valid = text.includes('is_valid:true')
    if (!valid) {
      console.error('[Steam] check_authentication échoué. Réponse Steam:', text.slice(0, 200))
      console.error('[Steam] openid.return_to:', params.get('openid.return_to'))
      console.error('[Steam] openid.realm (dans return_to):', params.get('openid.realm'))
    }
    return valid
  } catch (err) {
    console.error('[Steam] Erreur lors de la vérification OpenID:', err)
    return false
  }
}

/**
 * Récupère le profil Steam via l'API Web Steam.
 * Nécessite STEAM_API_KEY dans .env
 */
export async function fetchSteamProfile(steamId: string): Promise<SteamUser | null> {
  const apiKey = process.env.STEAM_API_KEY
  if (!apiKey) {
    // Sans clé API, retourner un profil minimal
    return {
      steamId,
      username:   `Joueur_${steamId.slice(-6)}`,
      avatar:     '',
      profileUrl: `https://steamcommunity.com/profiles/${steamId}`,
    }
  }

  try {
    const url = `${STEAM_API_URL}?key=${apiKey}&steamids=${steamId}`
    const res  = await fetch(url)
    const data = await res.json() as {
      response: { players: Array<{
        steamid: string; personaname: string
        avatarfull: string; profileurl: string
      }> }
    }
    const player = data.response?.players?.[0]
    if (!player) return null

    return {
      steamId:    player.steamid,
      username:   player.personaname,
      avatar:     player.avatarfull,
      profileUrl: player.profileurl,
    }
  } catch {
    return null
  }
}

/**
 * Génère un token de session sécurisé pour les joueurs Steam.
 */
export function generateSteamSessionToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
}
