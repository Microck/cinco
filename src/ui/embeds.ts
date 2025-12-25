import { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js'
import { fixImgurLink } from '../utils/imgur.js'

export function buildProductEmbed(product: Record<string, unknown>, baseUrl?: string | null, forAnnounce = false): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(0x2F3136)
  
  if (product.name) embed.setTitle(String(product.name))
  if (product.imageUrl) embed.setImage(fixImgurLink(String(product.imageUrl)))
  
  const fields: { name: string; value: string; inline: boolean }[] = []
  
  if (product.brand) fields.push({ name: 'Brand:', value: String(product.brand), inline: true })
  if (product.price) fields.push({ name: 'Price:', value: `$${product.price}`, inline: true })
  
  if (!forAnnounce) {
    const status = product.stock || product.status
    if (status) {
      const statusEmoji = status === 'STABLE' ? '🟢' : status === 'OUT' ? '🔴' : '⚪'
      fields.push({ name: 'Status:', value: `${statusEmoji} ${status}`, inline: true })
    }
  }

  const skipFields = [
    'id', 'name', 'brand', 'price', 'stock', 'status', 'category', 'imageUrl', 'productUrl',
    'threadCount', 'serial', 'images', 'rating'
  ]

  for (const [key, value] of Object.entries(product)) {
    if (skipFields.includes(key)) continue
    if (value === null || value === undefined || value === '') continue
    if (typeof value === 'object') continue
    if (fields.length >= 25) break
    
    const displayName = key.charAt(0).toUpperCase() + key.slice(1) + ':'
    fields.push({ name: displayName, value: String(value), inline: true })
  }
  
  if (fields.length > 0) embed.addFields(fields)
  
  const productUrl = forAnnounce
    ? (baseUrl && product.id ? `${baseUrl}/product/${product.id}` : null)
    : (product.productUrl ? String(product.productUrl) : (baseUrl && product.id ? `${baseUrl}/product/${product.id}` : null))
  
  if (productUrl) embed.setURL(productUrl)
  
  return embed
}

export function buildDropEmbed(drop: Record<string, unknown>): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(0x2F3136)
  
  if (drop.name) embed.setTitle(String(drop.name))
  if (drop.imageUrl) embed.setImage(fixImgurLink(String(drop.imageUrl)))
  
  const fields: { name: string; value: string; inline: boolean }[] = []
  
  if (drop.brand) fields.push({ name: 'Brand:', value: String(drop.brand), inline: true })
  if (drop.price) fields.push({ name: 'Price:', value: `$${drop.price}`, inline: true })
  
  if (drop.status) {
    const statusEmoji = drop.status === 'ACTIVE' ? '🟢' : '⚪'
    fields.push({ name: 'Status:', value: `${statusEmoji} ${drop.status}`, inline: true })
  }
  
  if (drop.releaseDate) fields.push({ name: 'Release:', value: String(drop.releaseDate), inline: true })
  if (drop.hint) fields.push({ name: 'Hint:', value: String(drop.hint), inline: false })
  
  if (fields.length > 0) embed.addFields(fields)
  
  return embed
}

export function buildProductModal(_guildId: string): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId('product_add')
    .setTitle('Add Product')
  
  const idInput = new TextInputBuilder()
    .setCustomId('id')
    .setLabel('ID (or URL to extract slug)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
  
  const nameInput = new TextInputBuilder()
    .setCustomId('name')
    .setLabel('Name')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
  
  const priceInput = new TextInputBuilder()
    .setCustomId('price')
    .setLabel('Price (USD)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
  
  const brandInput = new TextInputBuilder()
    .setCustomId('brand')
    .setLabel('Brand')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
  
  const imageInput = new TextInputBuilder()
    .setCustomId('imageUrl')
    .setLabel('Image URL (Imgur supported)')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
  
  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(idInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(priceInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(brandInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput),
  )
  
  return modal
}

export function buildProductEditModal(productId: string, product: Record<string, unknown>): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId(`product_edit:${productId}`)
    .setTitle('Edit Product')
  
  const nameInput = new TextInputBuilder()
    .setCustomId('name')
    .setLabel('Name')
    .setStyle(TextInputStyle.Short)
    .setValue(String(product.name || ''))
    .setRequired(true)
  
  const priceInput = new TextInputBuilder()
    .setCustomId('price')
    .setLabel('Price (USD)')
    .setStyle(TextInputStyle.Short)
    .setValue(String(product.price || ''))
    .setRequired(true)
  
  const brandInput = new TextInputBuilder()
    .setCustomId('brand')
    .setLabel('Brand')
    .setStyle(TextInputStyle.Short)
    .setValue(String(product.brand || ''))
    .setRequired(false)
  
  const imageInput = new TextInputBuilder()
    .setCustomId('imageUrl')
    .setLabel('Image URL (Imgur supported)')
    .setStyle(TextInputStyle.Short)
    .setValue(String(product.imageUrl || ''))
    .setRequired(false)
  
  const stockInput = new TextInputBuilder()
    .setCustomId('stock')
    .setLabel('Stock (STABLE or OUT)')
    .setStyle(TextInputStyle.Short)
    .setValue(String(product.stock || 'STABLE'))
    .setRequired(false)
  
  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(priceInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(brandInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(stockInput),
  )
  
  return modal
}

export function buildDropModal(_guildId: string): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId('drop_add')
    .setTitle('Add Drop')
  
  const idInput = new TextInputBuilder()
    .setCustomId('id')
    .setLabel('ID (or URL)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
  
  const nameInput = new TextInputBuilder()
    .setCustomId('name')
    .setLabel('Name')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
  
  const brandInput = new TextInputBuilder()
    .setCustomId('brand')
    .setLabel('Brand')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
  
  const hintInput = new TextInputBuilder()
    .setCustomId('hint')
    .setLabel('Hint / Description')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
  
  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(idInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(brandInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(hintInput),
  )
  
  return modal
}
