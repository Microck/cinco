import type { Interaction, ChatInputCommandInteraction, TextChannel } from 'discord.js'
import { hasPermission, isOwner } from '../utils/permissions.js'
import { getServerConfig } from '../database/models.js'
import { fetchGistData } from '../services/gist.js'
import { buildProductEmbed, buildDropEmbed } from '../ui/embeds.js'
import { detectDropsKey } from '../schema/detector.js'

export async function handleAnnounce(interaction: Interaction): Promise<void> {
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
  
  const type = cmd.options.getString('type', true)
  const id = cmd.options.getString('id', true)
  const channel = (cmd.options.getChannel('channel') || cmd.channel) as TextChannel
  
  await cmd.deferReply({ ephemeral: true })
  
  const data = await fetchGistData(cmd.guildId)
  
  let embed
  if (type === 'product') {
    const product = (data.products || []).find(p => p.id === id)
    if (!product) {
      await cmd.editReply(`Product not found: ${id}`)
      return
    }
    embed = buildProductEmbed(product)
  } else {
    const dropsKey = detectDropsKey(data)
    const drops = (data[dropsKey] || []) as Record<string, unknown>[]
    const drop = drops.find(d => d.id === id)
    if (!drop) {
      await cmd.editReply(`Drop not found: ${id}`)
      return
    }
    embed = buildDropEmbed(drop)
  }
  
  await channel.send({ embeds: [embed] })
  await cmd.editReply(`Announced to ${channel}`)
}
