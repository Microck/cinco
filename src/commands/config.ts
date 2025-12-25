import type { Interaction, ChatInputCommandInteraction } from 'discord.js'
import { hasPermission, isOwner } from '../utils/permissions.js'
import { setPermission, removePermission, getPermissions } from '../database/models.js'

export async function handleConfig(interaction: Interaction): Promise<void> {
  if (!interaction.isChatInputCommand()) return
  const cmd = interaction as ChatInputCommandInteraction
  
  if (!cmd.guildId) {
    await cmd.reply({ content: 'This command can only be used in a server', ephemeral: true })
    return
  }
  
  const canManage = isOwner(cmd.user.id) || hasPermission(cmd.guildId, cmd.user.id, cmd.member, 'admin')
  if (!canManage) {
    await cmd.reply({ content: 'You need admin permission to manage config', ephemeral: true })
    return
  }
  
  const sub = cmd.options.getSubcommand()
  
  if (sub === 'add') {
    const user = cmd.options.getUser('user')
    const role = cmd.options.getRole('role')
    const level = cmd.options.getString('level', true) as 'admin' | 'allowed'
    
    if (!user && !role) {
      await cmd.reply({ content: 'Specify a user or role', ephemeral: true })
      return
    }
    
    if (level === 'admin' && !isOwner(cmd.user.id)) {
      await cmd.reply({ content: 'Only the owner can grant admin permission', ephemeral: true })
      return
    }
    
    const targetType = user ? 'user' : 'role'
    const targetId = user?.id || role!.id
    const targetName = user?.tag || role!.name
    
    setPermission(cmd.guildId, targetType, targetId, level, cmd.user.id)
    await cmd.reply({ content: `Granted ${level} to ${targetName}`, ephemeral: true })
    return
  }
  
  if (sub === 'remove') {
    const user = cmd.options.getUser('user')
    const role = cmd.options.getRole('role')
    
    if (!user && !role) {
      await cmd.reply({ content: 'Specify a user or role', ephemeral: true })
      return
    }
    
    const targetType = user ? 'user' : 'role'
    const targetId = user?.id || role!.id
    
    const removed = removePermission(cmd.guildId, targetType, targetId)
    await cmd.reply({ 
      content: removed ? 'Permission removed' : 'No permission found', 
      ephemeral: true 
    })
    return
  }
  
  if (sub === 'list') {
    const perms = getPermissions(cmd.guildId)
    
    if (perms.length === 0) {
      await cmd.reply({ content: 'No permissions configured', ephemeral: true })
      return
    }
    
    const lines = perms.map(p => {
      const prefix = p.target_type === 'user' ? '<@' : '<@&'
      return `${prefix}${p.target_id}>: ${p.permission}`
    })
    
    await cmd.reply({ content: lines.join('\n'), ephemeral: true })
    return
  }
}
