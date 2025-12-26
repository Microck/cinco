import type { ModalSubmitInteraction } from 'discord.js'
import { upsertServerConfig } from '../database/models.js'
import { encrypt } from '../services/crypto.js'
import { fetchGistData, updateGistData } from '../services/gist.js'
import { isOwner } from '../utils/permissions.js'
import { UPCOMING_KEY } from '../schema/detector.js'
import { fixImgurLink } from '../utils/imgur.js'

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function extractSlug(input: string): string {
  if (!input) return ''
  // If it's a URL, get the last segment
  if (input.startsWith('http')) {
    try {
      const url = new URL(input)
      const pathname = url.pathname.replace(/\/$/, '') // remove trailing slash
      const segments = pathname.split('/')
      const last = segments.pop()
      return last || input
    } catch {
      return input
    }
  }
  return input
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
    const rawImageUrl = interaction.fields.getTextInputValue('imageUrl') || ''
    const imageUrl = fixImgurLink(rawImageUrl)
    
    if (rawImageUrl && !isValidUrl(rawImageUrl)) {
      await interaction.reply({ content: 'Invalid Image URL. Must start with http:// or https://', ephemeral: true })
      return
    }

    await interaction.deferReply({ ephemeral: true })
    
    const rawId = interaction.fields.getTextInputValue('id')
    const id = extractSlug(rawId)
    const name = interaction.fields.getTextInputValue('name')
    const price = parseFloat(interaction.fields.getTextInputValue('price')) || 0
    const brand = interaction.fields.getTextInputValue('brand') || ''
    
    const data = await fetchGistData(guildId)
    if (!data.products) data.products = []
    
    const products = data.products as Record<string, unknown>[]
    const newProduct = {
      id,
      brand,
      name,
      category: 'Apparel',
      price,
      status: 'AVAILABLE',
      productUrl: '',
      imageUrl
    }
    
    products.push(newProduct)
    await updateGistData(guildId, data)
    
    await interaction.editReply(`Added product: ${name} (ID: ${id})`)
    return
  }
  
  if (customId === 'drop_add') {
    await interaction.deferReply({ ephemeral: true })
    
    const rawId = interaction.fields.getTextInputValue('id')
    const id = extractSlug(rawId)
    const name = interaction.fields.getTextInputValue('name')
    const brand = interaction.fields.getTextInputValue('brand') || ''
    const hint = interaction.fields.getTextInputValue('hint') || ''
    
    const data = await fetchGistData(guildId)
    if (!data[UPCOMING_KEY]) data[UPCOMING_KEY] = []
    const drops = data[UPCOMING_KEY] as Record<string, unknown>[]
    
    const newDrop = {
      id,
      brand,
      name,
      category: 'Apparel',
      price: 'TBA',
      status: 'CONFIRMED',
      productUrl: '',
      imageUrl: ''
    }
    
    drops.push(newDrop)
    await updateGistData(guildId, data)
    
    await interaction.editReply(`Added drop: ${name} (ID: ${id})`)
    return
  }
  
  if (customId.startsWith('product_edit:')) {
    const rawImageUrl = interaction.fields.getTextInputValue('imageUrl') || ''
    const imageUrl = fixImgurLink(rawImageUrl)
    
    if (rawImageUrl && !isValidUrl(rawImageUrl)) {
      await interaction.reply({ content: 'Invalid Image URL. Must start with http:// or https://', ephemeral: true })
      return
    }

    const productId = customId.replace('product_edit:', '')
    await interaction.deferReply({ ephemeral: true })
    
    const name = interaction.fields.getTextInputValue('name')
    const price = parseFloat(interaction.fields.getTextInputValue('price')) || 0
    const brand = interaction.fields.getTextInputValue('brand') || ''
    const stock = interaction.fields.getTextInputValue('stock') || 'AVAILABLE'
    
    const data = await fetchGistData(guildId)
    const products = data.products as Record<string, unknown>[] || []
    const index = products.findIndex((p: Record<string, unknown>) => p.id === productId)
    
    if (index === -1) {
      await interaction.editReply(`Product not found: ${productId}`)
      return
    }
    
    products[index] = { ...products[index], name, price, brand, imageUrl, status: stock }
    
    data.products = products
    await updateGistData(guildId, data)
    
    await interaction.editReply(`Updated product: ${name}`)
    return
  }
}
