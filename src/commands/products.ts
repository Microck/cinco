import type { Interaction, ChatInputCommandInteraction } from 'discord.js'
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { hasPermission, isOwner } from '../utils/permissions.js'
import { getServerConfig } from '../database/models.js'

export async function handleProducts(interaction: Interaction): Promise<void> {
  if (!interaction.isChatInputCommand()) return
  const cmd = interaction as ChatInputCommandInteraction
  
  if (!cmd.guildId) {
    await cmd.reply({ content: 'Server only', ephemeral: true })
    return
  }
  
  const canManage = isOwner(cmd.user.id) || hasPermission(cmd.guildId, cmd.user.id, cmd.member, 'allowed')
  if (!canManage) {
    await cmd.reply({ content: 'No permission', ephemeral: true })
    return
  }
  
  const config = getServerConfig(cmd.guildId)
  if (!config?.gist_id || !config?.gist_token_encrypted) {
    await cmd.reply({ content: 'Not configured. Use /setup first', ephemeral: true })
    return
  }

  const embed = new EmbedBuilder()
    .setColor(0x2F3136)
    .setTitle('Products')
    .setDescription('Manage your product catalog')

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('product_add').setLabel('Add').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('product_list').setLabel('List').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('product_sync').setLabel('Sync').setStyle(ButtonStyle.Secondary)
  )

  await cmd.reply({ embeds: [embed], components: [row], ephemeral: true })
}
