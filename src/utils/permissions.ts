import { config } from '../config.js'
import { getPermissions } from '../database/models.js'
import type { GuildMember, APIInteractionGuildMember } from 'discord.js'

export function isOwner(userId: string): boolean {
  return userId === config.ownerId
}

export function hasPermission(
  guildId: string,
  userId: string,
  member: GuildMember | APIInteractionGuildMember | null,
  requiredLevel: 'admin' | 'allowed'
): boolean {
  if (isOwner(userId)) return true
  
  const perms = getPermissions(guildId)
  
  const userPerm = perms.find(p => p.target_type === 'user' && p.target_id === userId)
  if (userPerm) {
    if (requiredLevel === 'allowed') return true
    if (requiredLevel === 'admin' && userPerm.permission === 'admin') return true
  }
  
  if (member && 'roles' in member) {
    const roleIds = Array.isArray(member.roles) 
      ? member.roles 
      : [...member.roles.cache.keys()]
    
    for (const roleId of roleIds) {
      const rolePerm = perms.find(p => p.target_type === 'role' && p.target_id === roleId)
      if (rolePerm) {
        if (requiredLevel === 'allowed') return true
        if (requiredLevel === 'admin' && rolePerm.permission === 'admin') return true
      }
    }
  }
  
  return false
}
