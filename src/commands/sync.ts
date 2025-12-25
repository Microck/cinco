import type { Interaction, ChatInputCommandInteraction } from 'discord.js'
import { hasPermission, isOwner } from '../utils/permissions.js'
import { getServerConfig } from '../database/models.js'
import { fetchGistData } from '../services/gist.js'

export async function handleSync(interaction: Interaction): Promise<void> {
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
  
  await cmd.deferReply({ ephemeral: true })
  
  const data = await fetchGistData(cmd.guildId, true)
  const productCount = (data.products || []).length
  const dropsKey = Object.keys(data).find(k => 
    k !== 'products' && Array.isArray(data[k])
  ) || 'drops'
  const drops = (data[dropsKey] || []) as unknown[]
  const dropCount = drops.length
  
  await cmd.editReply(`Synced: ${productCount} products, ${dropCount} drops`)
}
