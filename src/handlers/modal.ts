import type { ModalSubmitInteraction } from 'discord.js'
import { upsertServerConfig } from '../database/models.js'
import { encrypt } from '../services/crypto.js'
import { fetchGistData, updateGistData } from '../services/gist.js'
import { isOwner } from '../utils/permissions.js'

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export async function handleModal(interaction: ModalSubmitInteraction): Promise<void> {
  const { customId, guildId } = interaction
  
  if (!guildId) {
    await interaction.reply({ content: 'Server only', ephemeral: true })
    return
  }
  
  if (customId === 'setup_token') {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({ content: 'Owner only', ephemeral: true })
      return
    }
    
    const token = interaction.fields.getTextInputValue('token')
    const encrypted = encrypt(token)
    upsertServerConfig(guildId, encrypted, null, null)
    await interaction.reply({ content: 'Token saved', ephemeral: true })
    return
  }
  
  if (customId === 'product_add') {
    const imageUrl = interaction.fields.getTextInputValue('imageUrl') || ''
    const productUrl = interaction.fields.getTextInputValue('productUrl') || ''
    
    if (imageUrl && !isValidUrl(imageUrl)) {
      await interaction.reply({ content: 'Invalid Image URL. Must start with http:// or https://', ephemeral: true })
      return
    }
    
    if (productUrl && !isValidUrl(productUrl)) {
      await interaction.reply({ content: 'Invalid Product URL. Must start with http:// or https://', ephemeral: true })
      return
    }

    await interaction.deferReply({ ephemeral: true })
    
    const id = interaction.fields.getTextInputValue('id')
    const name = interaction.fields.getTextInputValue('name')
    const price = parseFloat(interaction.fields.getTextInputValue('price')) || 0
    
    const data = await fetchGistData(guildId)
    if (!data.products) data.products = []
    
    data.products.push({ id, name, price, imageUrl, productUrl, stock: 'STABLE' })
    await updateGistData(guildId, data)
    
    await interaction.editReply(`Added product: ${name}`)
    return
  }
  
  if (customId === 'drop_add') {
    await interaction.deferReply({ ephemeral: true })
    
    const id = interaction.fields.getTextInputValue('id')
    const name = interaction.fields.getTextInputValue('name')
    const brand = interaction.fields.getTextInputValue('brand') || ''
    const hint = interaction.fields.getTextInputValue('hint') || ''
    
    const data = await fetchGistData(guildId)
    const dropsKey = Object.keys(data).find(k => 
      k !== 'products' && Array.isArray(data[k])
    ) || 'drops'
    
    if (!data[dropsKey]) data[dropsKey] = []
    const drops = data[dropsKey] as Record<string, unknown>[]
    
    drops.push({ id, name, brand, hint, status: 'PENDING' })
    await updateGistData(guildId, data)
    
    await interaction.editReply(`Added drop: ${name}`)
    return
  }
  
  if (customId.startsWith('product_edit:')) {
    const imageUrl = interaction.fields.getTextInputValue('imageUrl') || ''
    const productUrl = interaction.fields.getTextInputValue('productUrl') || ''
    
    if (imageUrl && !isValidUrl(imageUrl)) {
      await interaction.reply({ content: 'Invalid Image URL. Must start with http:// or https://', ephemeral: true })
      return
    }
    
    if (productUrl && !isValidUrl(productUrl)) {
      await interaction.reply({ content: 'Invalid Product URL. Must start with http:// or https://', ephemeral: true })
      return
    }

    const productId = customId.replace('product_edit:', '')
    await interaction.deferReply({ ephemeral: true })
    
    const name = interaction.fields.getTextInputValue('name')
    const price = parseFloat(interaction.fields.getTextInputValue('price')) || 0
    const stock = interaction.fields.getTextInputValue('stock') || 'STABLE'
    
    const data = await fetchGistData(guildId)
    const products = data.products || []
    const index = products.findIndex(p => p.id === productId)
    
    if (index === -1) {
      await interaction.editReply(`Product not found: ${productId}`)
      return
    }
    
    products[index] = { ...products[index], name, price, imageUrl, productUrl, stock }
    data.products = products
    await updateGistData(guildId, data)
    
    await interaction.editReply(`Updated product: ${name}`)
    return
  }
}
