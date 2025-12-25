import { getDb } from './db.js'

export interface ServerConfig {
  guild_id: string
  gist_token_encrypted: string | null
  gist_id: string | null
  schema_profile: string | null
  created_at: number
  updated_at: number
}

export interface Permission {
  id: number
  guild_id: string
  target_type: 'user' | 'role'
  target_id: string
  permission: 'admin' | 'allowed'
  granted_by: string
  granted_at: number
}

export interface CacheEntry {
  guild_id: string
  data: string
  fetched_at: number
}

export function getServerConfig(guildId: string): ServerConfig | undefined {
  const db = getDb()
  return db.prepare('SELECT * FROM servers WHERE guild_id = ?').get(guildId) as ServerConfig | undefined
}

export function upsertServerConfig(
  guildId: string,
  tokenEncrypted: string | null,
  gistId: string | null,
  schemaProfile: string | null
): void {
  const db = getDb()
  db.prepare(`
    INSERT INTO servers (guild_id, gist_token_encrypted, gist_id, schema_profile)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(guild_id) DO UPDATE SET
      gist_token_encrypted = COALESCE(excluded.gist_token_encrypted, gist_token_encrypted),
      gist_id = COALESCE(excluded.gist_id, gist_id),
      schema_profile = COALESCE(excluded.schema_profile, schema_profile),
      updated_at = unixepoch()
  `).run(guildId, tokenEncrypted, gistId, schemaProfile)
}

export function getPermissions(guildId: string): Permission[] {
  const db = getDb()
  return db.prepare('SELECT * FROM permissions WHERE guild_id = ?').all(guildId) as Permission[]
}

export function setPermission(
  guildId: string,
  targetType: 'user' | 'role',
  targetId: string,
  permission: 'admin' | 'allowed',
  grantedBy: string
): void {
  const db = getDb()
  db.prepare(`
    INSERT INTO permissions (guild_id, target_type, target_id, permission, granted_by)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(guild_id, target_type, target_id) DO UPDATE SET
      permission = excluded.permission,
      granted_by = excluded.granted_by,
      granted_at = unixepoch()
  `).run(guildId, targetType, targetId, permission, grantedBy)
}

export function removePermission(guildId: string, targetType: 'user' | 'role', targetId: string): boolean {
  const db = getDb()
  const result = db.prepare('DELETE FROM permissions WHERE guild_id = ? AND target_type = ? AND target_id = ?')
    .run(guildId, targetType, targetId)
  return result.changes > 0
}

export function getCache(guildId: string): CacheEntry | undefined {
  const db = getDb()
  return db.prepare('SELECT * FROM cache WHERE guild_id = ?').get(guildId) as CacheEntry | undefined
}

export function setCache(guildId: string, data: string): void {
  const db = getDb()
  db.prepare(`
    INSERT INTO cache (guild_id, data)
    VALUES (?, ?)
    ON CONFLICT(guild_id) DO UPDATE SET
      data = excluded.data,
      fetched_at = unixepoch()
  `).run(guildId, data)
}
