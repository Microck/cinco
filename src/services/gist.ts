import { getServerConfig, setCache, getCache } from '../database/models.js'
import { decrypt } from './crypto.js'

const CACHE_TTL = 5 * 60 * 1000

export interface GistData {
  products?: Record<string, unknown>[]
  [key: string]: unknown
}

export async function fetchGistData(guildId: string, force = false): Promise<GistData> {
  if (!force) {
    const cached = getCache(guildId)
    if (cached && Date.now() - cached.fetched_at * 1000 < CACHE_TTL) {
      return JSON.parse(cached.data)
    }
  }
  
  const config = getServerConfig(guildId)
  if (!config?.gist_token_encrypted || !config?.gist_id) {
    throw new Error('Server not configured')
  }
  
  const token = decrypt(config.gist_token_encrypted)
  
  const res = await fetch(`https://api.github.com/gists/${config.gist_id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  })
  
  if (!res.ok) {
    throw new Error(`Gist fetch failed: ${res.status}`)
  }
  
  const gist = await res.json() as { files: Record<string, { content: string }> }
  const file = Object.values(gist.files)[0]
  
  if (!file?.content) {
    throw new Error('Gist has no content')
  }
  
  const data = JSON.parse(file.content)
  setCache(guildId, JSON.stringify(data))
  
  return data
}

export async function updateGistData(guildId: string, data: GistData): Promise<void> {
  const config = getServerConfig(guildId)
  if (!config?.gist_token_encrypted || !config?.gist_id) {
    throw new Error('Server not configured')
  }
  
  const token = decrypt(config.gist_token_encrypted)
  
  const gistRes = await fetch(`https://api.github.com/gists/${config.gist_id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  })
  
  if (!gistRes.ok) {
    throw new Error(`Gist fetch failed: ${gistRes.status}`)
  }
  
  const gist = await gistRes.json() as { files: Record<string, unknown> }
  const filename = Object.keys(gist.files)[0]
  
  const updateRes = await fetch(`https://api.github.com/gists/${config.gist_id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: {
        [filename]: {
          content: JSON.stringify(data, null, 2),
        },
      },
    }),
  })
  
  if (!updateRes.ok) {
    throw new Error(`Gist update failed: ${updateRes.status}`)
  }
  
  setCache(guildId, JSON.stringify(data))
}
