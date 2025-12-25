import type { Interaction, ChatInputCommandInteraction } from 'discord.js'
import { hasPermission, isOwner } from '../utils/permissions.js'
import { getServerConfig } from '../database/models.js'
import { fetchGistData, updateGistData } from '../services/gist.js'
import { buildProductEmbed, buildProductModal, buildProductEditModal } from '../ui/embeds.js'

export async function handleProduct(interaction: Interaction): Promise<void> {
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
    const products = data.products || []
    
    if (products.length === 0) {
      await cmd.editReply('No products found')
      return
    }
    
    const lines = products.slice(0, 25).map((p, i) => 
      `${i + 1}. ${p.name || p.id || 'Unknown'}`
    )
    
    if (products.length > 25) {
      lines.push(`... and ${products.length - 25} more`)
    }
    
    await cmd.editReply(lines.join('\n'))
    return
  }
  
  if (sub === 'add') {
    const modal = buildProductModal(cmd.guildId)
    await cmd.showModal(modal)
    return
  }
  
  if (sub === 'view') {
    const id = cmd.options.getString('id', true)
    await cmd.deferReply({ ephemeral: true })
    
    const data = await fetchGistData(cmd.guildId)
    const product = (data.products || []).find(p => p.id === id)
    
    if (!product) {
      await cmd.editReply(`Product not found: ${id}`)
      return
    }
    
    const embed = buildProductEmbed(product)
    await cmd.editReply({ embeds: [embed] })
    return
  }
  
  if (sub === 'edit') {
    const id = cmd.options.getString('id', true)
    
    const data = await fetchGistData(cmd.guildId)
    const product = (data.products || []).find(p => p.id === id)
    
    if (!product) {
      await cmd.reply({ content: `Product not found: ${id}`, ephemeral: true })
      return
    }
    
    const modal = buildProductEditModal(id, product)
    await cmd.showModal(modal)
    return
  }
  
  if (sub === 'delete') {
    const id = cmd.options.getString('id', true)
    await cmd.deferReply({ ephemeral: true })
    
    const data = await fetchGistData(cmd.guildId)
    const products = data.products || []
    const index = products.findIndex(p => p.id === id)
    
    if (index === -1) {
      await cmd.editReply(`Product not found: ${id}`)
      return
    }
    
    products.splice(index, 1)
    data.products = products
    await updateGistData(cmd.guildId, data)
    await cmd.editReply(`Deleted product: ${id}`)
    return
  }
}
