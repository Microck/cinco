import { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js'

export function buildProductEmbed(product: Record<string, unknown>): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(0x121417)
  
  if (product.name) embed.setTitle(String(product.name))
  if (product.imageUrl) embed.setImage(fixImgurLink(String(product.imageUrl)))
  
  const fields: { name: string; value: string; inline: boolean }[] = []
  
  if (product.brand) fields.push({ name: 'Brand', value: String(product.brand), inline: true })
  if (product.price) fields.push({ name: 'Price', value: `$${product.price}`, inline: true })
  if (product.stock || product.status) {
    fields.push({ name: 'Status', value: String(product.stock || product.status), inline: true })
  }
  if (product.category) fields.push({ name: 'Category', value: String(product.category), inline: true })
  
  const skipFields = ['id', 'name', 'brand', 'price', 'stock', 'status', 'category', 'imageUrl', 'productUrl']
  for (const [key, value] of Object.entries(product)) {
    if (skipFields.includes(key)) continue
    if (value === null || value === undefined || value === '') continue
    if (typeof value === 'object') continue
    if (fields.length >= 25) break
    
    fields.push({ name: key, value: String(value), inline: true })
  }
  
  if (fields.length > 0) embed.addFields(fields)
  
  if (product.productUrl) {
    embed.setURL(String(product.productUrl))
  }
  
  return embed
}

export function buildDropEmbed(drop: Record<string, unknown>): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(0x121417)
  
  if (drop.name) embed.setTitle(String(drop.name))
  if (drop.imageUrl) embed.setImage(fixImgurLink(String(drop.imageUrl)))
  
  const fields: { name: string; value: string; inline: boolean }[] = []
  
  if (drop.brand) fields.push({ name: 'Brand', value: String(drop.brand), inline: true })
  if (drop.price) fields.push({ name: 'Price', value: String(drop.price), inline: true })
  if (drop.status) fields.push({ name: 'Status', value: String(drop.status), inline: true })
  if (drop.releaseDate) fields.push({ name: 'Release', value: String(drop.releaseDate), inline: true })
  if (drop.hint) fields.push({ name: 'Hint', value: String(drop.hint), inline: false })
  
  if (fields.length > 0) embed.addFields(fields)
  
  return embed
}

function fixImgurLink(url: string): string {
  if (!url.includes('imgur.com')) return url
  
  if (url.includes('i.imgur.com') && /\.(jpg|jpeg|png|gif|webp)$/i.test(url)) return url
  
  const match = /imgur\.com\/(?:a\/|gallery\/)?([a-zA-Z0-9]{5,})/i.exec(url)
  if (match && match[1]) {
    return `https://i.imgur.com/${match[1]}.png`
  }
  
  return url
}

export function buildProductModal(_guildId: string): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId('product_add')
    .setTitle('Add Product')
  
  const idInput = new TextInputBuilder()
    .setCustomId('id')
    .setLabel('ID (url slug)')
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
  
  const imageInput = new TextInputBuilder()
    .setCustomId('imageUrl')
    .setLabel('Image URL')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
  
  const urlInput = new TextInputBuilder()
    .setCustomId('productUrl')
    .setLabel('Product URL')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
  
  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(idInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(priceInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(urlInput),
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
  
  const imageInput = new TextInputBuilder()
    .setCustomId('imageUrl')
    .setLabel('Image URL')
    .setStyle(TextInputStyle.Short)
    .setValue(String(product.imageUrl || ''))
    .setRequired(false)
  
  const urlInput = new TextInputBuilder()
    .setCustomId('productUrl')
    .setLabel('Product URL')
    .setStyle(TextInputStyle.Short)
    .setValue(String(product.productUrl || ''))
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
    new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(urlInput),
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
    .setLabel('ID')
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
