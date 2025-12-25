import type { StringSelectMenuInteraction } from 'discord.js'
import { fetchGistData } from '../services/gist.js'
import { buildProductEmbed, buildDropEmbed, buildProductEditModal } from '../ui/embeds.js'
import { buildProductActionButtons, buildUpcomingActionButtons } from './button.js'
import { detectDropsKey } from '../schema/detector.js'
import { hasPermission, isOwner } from '../utils/permissions.js'
import { getServerConfig } from '../database/models.js'

export async function handleSelectMenu(interaction: StringSelectMenuInteraction): Promise<void> {
  const { customId, values, guildId, user, member } = interaction
  if (!guildId) return
  
  const canManage = isOwner(user.id) || hasPermission(guildId, user.id, member, 'allowed')
  if (!canManage) {
    await interaction.reply({ content: 'No permission', ephemeral: true })
    return
  }
  
  const id = values[0]
  if (!id) return
  
  const config = getServerConfig(guildId)
  const [type, action] = customId.split(':')
  
  if (type === 'product_select') {
    const data = await fetchGistData(guildId)
    const products = (data.products || []) as Record<string, unknown>[]
    const product = products.find(p => String(p.id) === id)
    
    if (!product) {
      await interaction.reply({ content: 'Product not found', ephemeral: true })
      return
    }

    if (action === 'manage') {
      await interaction.deferUpdate()
      const embed = buildProductEmbed(product, config?.base_url)
      const buttons = buildProductActionButtons(String(product.id))
      await interaction.editReply({ embeds: [embed], components: [buttons] })
      return
    }

    if (action === 'edit') {
      await interaction.showModal(buildProductEditModal(String(product.id), product))
      return
    }
  }
  
  if (type === 'upcoming_select') {
    const data = await fetchGistData(guildId)
    const dropsKey = detectDropsKey(data)
    const drops = (data[dropsKey] || []) as Record<string, unknown>[]
    const drop = drops.find(d => String(d.id) === id)
    
    if (!drop) {
      await interaction.reply({ content: 'Item not found', ephemeral: true })
      return
    }

    if (action === 'manage') {
      await interaction.deferUpdate()
      const embed = buildDropEmbed(drop)
      const buttons = buildUpcomingActionButtons(String(drop.id))
      await interaction.editReply({ embeds: [embed], components: [buttons] })
      return
    }
  }
}
