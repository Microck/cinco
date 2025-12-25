import type { Interaction, ChatInputCommandInteraction } from 'discord.js'
import { hasPermission, isOwner } from '../utils/permissions.js'
import { getServerConfig } from '../database/models.js'
import { fetchGistData, updateGistData, type GistData } from '../services/gist.js'
import { buildDropEmbed, buildDropModal } from '../ui/embeds.js'
import { detectDropsKey } from '../schema/detector.js'
import { buildDropSelectMenu } from '../ui/menus.js'

export async function handleDrop(interaction: Interaction): Promise<void> {
  if (!interaction.isChatInputCommand()) return
  const cmd = interaction as ChatInputCommandInteraction
  
  if (!cmd.guildId) {
    await cmd.reply({ content: 'This command can only be used in a server', ephemeral: true })
    return
  }
  
  const canManage = isOwner(cmd.user.id) || hasPermission(cmd.guildId, cmd.user.id, cmd.member, 'admin')
  if (!canManage) {
    await cmd.reply({ content: 'You need admin permission', ephemeral: true })
    return
  }
  
  const config = getServerConfig(cmd.guildId)
  if (!config?.gist_id || !config?.gist_token_encrypted) {
    await cmd.reply({ content: 'Server not configured. Use /setup first', ephemeral: true })
    return
  }
  
  const sub = cmd.options.getSubcommand()
  
  if (sub === 'list') {
    await cmd.deferReply({ ephemeral: true })
    const data = await fetchGistData(cmd.guildId)
    const dropsKey = detectDropsKey(data)
    const drops = (data[dropsKey] || []) as Record<string, unknown>[]
    
    if (drops.length === 0) {
      await cmd.editReply('No drops found')
      return
    }
    
    const lines = drops.slice(0, 25).map((d, i) => 
      `${i + 1}. ${d.name || d.id || 'Unknown'}`
    )
    
    if (drops.length > 25) {
      lines.push(`... and ${drops.length - 25} more`)
    }
    
    await cmd.editReply(lines.join('\n'))
    return
  }
  
  if (sub === 'add') {
    const modal = buildDropModal(cmd.guildId)
    await cmd.showModal(modal)
    return
  }
  
  if (sub === 'view') {
    const id = cmd.options.getString('id')
    
    if (!id) {
      const data = await fetchGistData(cmd.guildId)
      const dropsKey = detectDropsKey(data)
      const drops = (data[dropsKey] || []) as Record<string, unknown>[]
      
      if (drops.length === 0) {
        await cmd.reply({ content: 'No drops found to view', ephemeral: true })
        return
      }
      
      const menu = buildDropSelectMenu(drops, 'view')
      await cmd.reply({ content: 'Select a drop to view:', components: [menu], ephemeral: true })
      return
    }

    await cmd.deferReply({ ephemeral: true })
    
    const data = await fetchGistData(cmd.guildId)
    const dropsKey = detectDropsKey(data)
    const drops = (data[dropsKey] || []) as Record<string, unknown>[]
    const drop = drops.find(d => d.id === id)
    
    if (!drop) {
      await cmd.editReply(`Drop not found: ${id}`)
      return
    }
    
    const embed = buildDropEmbed(drop)
    await cmd.editReply({ embeds: [embed] })
    return
  }
  
  if (sub === 'delete') {
    const id = cmd.options.getString('id')
    
    if (!id) {
      const data = await fetchGistData(cmd.guildId)
      const dropsKey = detectDropsKey(data)
      const drops = (data[dropsKey] || []) as Record<string, unknown>[]
      
      if (drops.length === 0) {
        await cmd.reply({ content: 'No drops found to delete', ephemeral: true })
        return
      }
      
      const menu = buildDropSelectMenu(drops, 'delete')
      await cmd.reply({ content: 'Select a drop to delete:', components: [menu], ephemeral: true })
      return
    }

    await cmd.deferReply({ ephemeral: true })
    
    const data = await fetchGistData(cmd.guildId)
    const dropsKey = detectDropsKey(data)
    const drops = (data[dropsKey] || []) as Record<string, unknown>[]
    const index = drops.findIndex(d => d.id === id)
    
    if (index === -1) {
      await cmd.editReply(`Drop not found: ${id}`)
      return
    }
    
    drops.splice(index, 1)
    ;(data as GistData)[dropsKey] = drops
    await updateGistData(cmd.guildId, data)
    await cmd.editReply(`Deleted drop: ${id}`)
    return
  }
}
