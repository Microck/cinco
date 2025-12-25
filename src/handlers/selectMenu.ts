import type { StringSelectMenuInteraction } from 'discord.js'
import { fetchGistData, updateGistData, type GistData } from '../services/gist.js'
import { buildProductEmbed, buildDropEmbed, buildProductEditModal } from '../ui/embeds.js'
import { detectDropsKey } from '../schema/detector.js'
import { hasPermission, isOwner } from '../utils/permissions.js'
import { getServerConfig } from '../database/models.js'

export async function handleSelectMenu(interaction: StringSelectMenuInteraction): Promise<void> {
  const { customId, values, guildId, user, member } = interaction
  if (!guildId) return
  
  const canManage = isOwner(user.id) || hasPermission(guildId, user.id, member, 'admin')
  if (!canManage) {
    await interaction.reply({ content: 'You need admin permission', ephemeral: true })
    return
  }
  
  const id = values[0]
  if (!id) return
  
  const config = getServerConfig(guildId)
  
  if (customId.startsWith('product_select_')) {
    const action = customId.replace('product_select_', '') as 'view' | 'edit' | 'delete'
    const data = await fetchGistData(guildId)
    const products = data.products || []
    const product = products.find(p => String(p.id) === id)
    
    if (!product) {
      await interaction.reply({ content: `Product not found: ${id}`, ephemeral: true })
      return
    }
    
    if (action === 'view') {
      await interaction.deferReply({ ephemeral: true })
      const embed = buildProductEmbed(product, config?.base_url)
      await interaction.editReply({ embeds: [embed] })
      return
    }
    
    if (action === 'edit') {
      const modal = buildProductEditModal(String(product.id), product)
      await interaction.showModal(modal)
      return
    }
    
    if (action === 'delete') {
      await interaction.deferReply({ ephemeral: true })
      const index = products.findIndex(p => String(p.id) === id)
      if (index !== -1) {
        products.splice(index, 1)
        data.products = products
        await updateGistData(guildId, data)
        await interaction.editReply(`Deleted product: ${id}`)
      } else {
        await interaction.editReply(`Product already deleted: ${id}`)
      }
      return
    }
  }
  
  if (customId.startsWith('drop_select_')) {
    const action = customId.replace('drop_select_', '') as 'view' | 'edit' | 'delete'
    const data = await fetchGistData(guildId)
    const dropsKey = detectDropsKey(data)
    const drops = (data[dropsKey] || []) as Record<string, unknown>[]
    const drop = drops.find(d => String(d.id) === id)
    
    if (!drop) {
      await interaction.reply({ content: `Drop not found: ${id}`, ephemeral: true })
      return
    }
    
    if (action === 'view') {
      await interaction.deferReply({ ephemeral: true })
      const embed = buildDropEmbed(drop)
      await interaction.editReply({ embeds: [embed] })
      return
    }
    
    if (action === 'edit') {
      await interaction.reply({ content: 'Edit drop via interactive menu not fully supported yet (requires complex modal state). Use manual ID for now.', ephemeral: true })
      return
    }
    
    if (action === 'delete') {
      await interaction.deferReply({ ephemeral: true })
      const index = drops.findIndex(d => String(d.id) === id)
      if (index !== -1) {
        drops.splice(index, 1)
        ;(data as GistData)[dropsKey] = drops
        await updateGistData(guildId, data)
        await interaction.editReply(`Deleted drop: ${id}`)
      } else {
        await interaction.editReply(`Drop already deleted: ${id}`)
      }
      return
    }
  }
}
