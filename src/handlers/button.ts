import type { ButtonInteraction, Message, TextChannel } from 'discord.js'
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } from 'discord.js'
import { hasPermission, isOwner } from '../utils/permissions.js'
import { getServerConfig } from '../database/models.js'
import { fetchGistData, updateGistData } from '../services/gist.js'
import { uploadToCatbox } from '../services/catbox.js'
import { buildProductEmbed, buildDropEmbed, buildProductModal, buildProductEditModal, buildDropModal } from '../ui/embeds.js'
import { buildProductSelectMenu, buildUpcomingSelectMenu } from '../ui/menus.js'
import { detectDropsKey } from '../schema/detector.js'

export async function handleButton(interaction: ButtonInteraction): Promise<void> {
  const [action, ...args] = interaction.customId.split(':')
  const guildId = interaction.guildId
  
  if (!guildId) {
    await interaction.reply({ content: 'Server only', ephemeral: true })
    return
  }

  const canManage = isOwner(interaction.user.id) || hasPermission(guildId, interaction.user.id, interaction.member, 'allowed')
  if (!canManage) {
    await interaction.reply({ content: 'No permission', ephemeral: true })
    return
  }

  const config = getServerConfig(guildId)
  if (!config?.gist_id && action !== 'help') {
    await interaction.reply({ content: 'Not configured. Use /setup first', ephemeral: true })
    return
  }

  switch (action) {
    case 'product_add':
      await interaction.showModal(buildProductModal(guildId))
      break

    case 'product_list':
      await handleProductList(interaction)
      break

    case 'product_sync':
      await handleSync(interaction)
      break

    case 'product_edit':
      await handleProductEdit(interaction, args[0])
      break

    case 'product_delete':
      await handleProductDelete(interaction, args[0])
      break

    case 'product_announce':
      await handleProductAnnounce(interaction, args[0])
      break

    case 'upcoming_add':
      await interaction.showModal(buildDropModal(guildId))
      break

    case 'upcoming_list':
      await handleUpcomingList(interaction)
      break

    case 'upcoming_edit':
      await handleUpcomingEdit(interaction, args[0])
      break

    case 'upcoming_delete':
      await handleUpcomingDelete(interaction, args[0])
      break

    case 'upcoming_announce':
      await handleUpcomingAnnounce(interaction, args[0])
      break

    case 'image_upload':
      await handleImageUploadPrompt(interaction, args[0] as 'product' | 'upcoming', args[1])
      break

    case 'image_skip':
      await handleImageSkip(interaction, args[0] as 'product' | 'upcoming', args[1])
      break

    case 'back_products':
      await showProductsMenu(interaction)
      break

    case 'back_upcoming':
      await showUpcomingMenu(interaction)
      break

    default:
      await interaction.reply({ content: 'Unknown action', ephemeral: true })
  }
}

async function handleProductList(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferUpdate()
  const data = await fetchGistData(interaction.guildId!)
  const products = (data.products || []) as Record<string, unknown>[]
  
  if (products.length === 0) {
    await interaction.editReply({ content: 'No products yet', components: [] })
    return
  }

  const embed = new EmbedBuilder()
    .setColor(0x2F3136)
    .setTitle('Select a Product')
    .setDescription(`${products.length} products`)

  const selectRow = buildProductSelectMenu(products, 'manage')
  const backRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('back_products').setLabel('Back').setStyle(ButtonStyle.Secondary)
  )

  await interaction.editReply({ embeds: [embed], components: [selectRow, backRow] })
}

async function handleSync(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferUpdate()
  const data = await fetchGistData(interaction.guildId!, true)
  const products = (data.products || []) as unknown[]
  const dropsKey = detectDropsKey(data)
  const drops = (data[dropsKey] || []) as unknown[]
  
  await interaction.followUp({ content: `Synced: ${products.length} products, ${drops.length} upcoming`, ephemeral: true })
}

async function handleProductEdit(interaction: ButtonInteraction, productId: string): Promise<void> {
  const data = await fetchGistData(interaction.guildId!)
  const products = (data.products || []) as Record<string, unknown>[]
  const product = products.find(p => p.id === productId)
  
  if (!product) {
    await interaction.reply({ content: 'Product not found', ephemeral: true })
    return
  }

  await interaction.showModal(buildProductEditModal(productId, product))
}

async function handleProductDelete(interaction: ButtonInteraction, productId: string): Promise<void> {
  await interaction.deferUpdate()
  const data = await fetchGistData(interaction.guildId!)
  const products = (data.products || []) as Record<string, unknown>[]
  const idx = products.findIndex(p => p.id === productId)
  
  if (idx === -1) {
    await interaction.followUp({ content: 'Product not found', ephemeral: true })
    return
  }

  const deleted = products.splice(idx, 1)[0]
  data.products = products
  await updateGistData(interaction.guildId!, data)
  
  await interaction.followUp({ content: `Deleted: ${deleted.name}`, ephemeral: true })
  await showProductsMenu(interaction)
}

async function handleProductAnnounce(interaction: ButtonInteraction, productId: string): Promise<void> {
  const config = getServerConfig(interaction.guildId!)
  const data = await fetchGistData(interaction.guildId!)
  const products = (data.products || []) as Record<string, unknown>[]
  const product = products.find(p => p.id === productId)
  
  if (!product) {
    await interaction.reply({ content: 'Product not found', ephemeral: true })
    return
  }

  const embed = buildProductEmbed(product, config?.base_url, true)
  const channel = interaction.channel as TextChannel
  
  await channel.send({ embeds: [embed] })
  await interaction.reply({ content: 'Announced!', ephemeral: true })
}

async function handleUpcomingList(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferUpdate()
  const data = await fetchGistData(interaction.guildId!)
  const dropsKey = detectDropsKey(data)
  const drops = (data[dropsKey] || []) as Record<string, unknown>[]
  
  if (drops.length === 0) {
    await interaction.editReply({ content: 'No upcoming items yet', components: [] })
    return
  }

  const embed = new EmbedBuilder()
    .setColor(0x2F3136)
    .setTitle('Select an Upcoming Item')
    .setDescription(`${drops.length} items`)

  const selectRow = buildUpcomingSelectMenu(drops, 'manage')
  const backRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('back_upcoming').setLabel('Back').setStyle(ButtonStyle.Secondary)
  )

  await interaction.editReply({ embeds: [embed], components: [selectRow, backRow] })
}

async function handleUpcomingEdit(interaction: ButtonInteraction, dropId: string): Promise<void> {
  const data = await fetchGistData(interaction.guildId!)
  const dropsKey = detectDropsKey(data)
  const drops = (data[dropsKey] || []) as Record<string, unknown>[]
  const drop = drops.find(d => d.id === dropId)
  
  if (!drop) {
    await interaction.reply({ content: 'Item not found', ephemeral: true })
    return
  }

  await interaction.showModal(buildDropModal(interaction.guildId!))
}

async function handleUpcomingDelete(interaction: ButtonInteraction, dropId: string): Promise<void> {
  await interaction.deferUpdate()
  const data = await fetchGistData(interaction.guildId!)
  const dropsKey = detectDropsKey(data)
  const drops = (data[dropsKey] || []) as Record<string, unknown>[]
  const idx = drops.findIndex(d => d.id === dropId)
  
  if (idx === -1) {
    await interaction.followUp({ content: 'Item not found', ephemeral: true })
    return
  }

  const deleted = drops.splice(idx, 1)[0]
  data[dropsKey] = drops
  await updateGistData(interaction.guildId!, data)
  
  await interaction.followUp({ content: `Deleted: ${deleted.name}`, ephemeral: true })
  await showUpcomingMenu(interaction)
}

async function handleUpcomingAnnounce(interaction: ButtonInteraction, dropId: string): Promise<void> {
  const data = await fetchGistData(interaction.guildId!)
  const dropsKey = detectDropsKey(data)
  const drops = (data[dropsKey] || []) as Record<string, unknown>[]
  const drop = drops.find(d => d.id === dropId)
  
  if (!drop) {
    await interaction.reply({ content: 'Item not found', ephemeral: true })
    return
  }

  const embed = buildDropEmbed(drop)
  const channel = interaction.channel as TextChannel
  
  await channel.send({ embeds: [embed] })
  await interaction.reply({ content: 'Announced!', ephemeral: true })
}

async function handleImageUploadPrompt(interaction: ButtonInteraction, type: 'product' | 'upcoming', tempId: string): Promise<void> {
  await interaction.reply({ 
    content: 'Send an image now (you have 60 seconds)', 
    ephemeral: true 
  })

  const channel = interaction.channel
  if (!channel || channel.type !== ChannelType.GuildText) return

  try {
    const collected = await channel.awaitMessages({
      filter: (m: Message) => m.author.id === interaction.user.id && m.attachments.size > 0,
      max: 1,
      time: 60000,
      errors: ['time']
    })

    const message = collected.first()
    const attachment = message?.attachments.first()
    
    if (!attachment) {
      await interaction.followUp({ content: 'No image found', ephemeral: true })
      return
    }

    await interaction.followUp({ content: 'Uploading to Catbox...', ephemeral: true })
    
    const imageUrl = await uploadToCatbox(attachment.url)
    await message?.delete().catch(() => {})
    
    await saveWithImage(interaction.guildId!, type, tempId, imageUrl)
    await interaction.followUp({ content: `Image uploaded: ${imageUrl}`, ephemeral: true })
    
  } catch {
    await interaction.followUp({ content: 'Timed out or no image received', ephemeral: true })
  }
}

async function handleImageSkip(interaction: ButtonInteraction, _type: 'product' | 'upcoming', _tempId: string): Promise<void> {
  await interaction.deferUpdate()
  await interaction.followUp({ content: 'Saved without image', ephemeral: true })
}

async function saveWithImage(guildId: string, type: 'product' | 'upcoming', tempId: string, imageUrl: string): Promise<void> {
  const data = await fetchGistData(guildId)
  
  if (type === 'product') {
    const products = (data.products || []) as Record<string, unknown>[]
    const product = products.find(p => p.id === tempId)
    if (product) {
      product.imageUrl = imageUrl
      await updateGistData(guildId, data)
    }
  } else {
    const dropsKey = detectDropsKey(data)
    const drops = (data[dropsKey] || []) as Record<string, unknown>[]
    const drop = drops.find(d => d.id === tempId)
    if (drop) {
      drop.imageUrl = imageUrl
      await updateGistData(guildId, data)
    }
  }
}

async function showProductsMenu(interaction: ButtonInteraction): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(0x2F3136)
    .setTitle('Products')
    .setDescription('Manage your product catalog')

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('product_add').setLabel('Add').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('product_list').setLabel('List').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('product_sync').setLabel('Sync').setStyle(ButtonStyle.Secondary)
  )

  await interaction.editReply({ embeds: [embed], components: [row] })
}

async function showUpcomingMenu(interaction: ButtonInteraction): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(0x2F3136)
    .setTitle('Upcoming')
    .setDescription('Manage upcoming releases')

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('upcoming_add').setLabel('Add').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('upcoming_list').setLabel('List').setStyle(ButtonStyle.Primary)
  )

  await interaction.editReply({ embeds: [embed], components: [row] })
}

export function buildImagePromptButtons(type: 'product' | 'upcoming', itemId: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`image_upload:${type}:${itemId}`).setLabel('Upload Image').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`image_skip:${type}:${itemId}`).setLabel('Skip').setStyle(ButtonStyle.Secondary)
  )
}

export function buildProductActionButtons(productId: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`product_edit:${productId}`).setLabel('Edit').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`product_delete:${productId}`).setLabel('Delete').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId(`product_announce:${productId}`).setLabel('Announce').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('back_products').setLabel('Back').setStyle(ButtonStyle.Secondary)
  )
}

export function buildUpcomingActionButtons(dropId: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`upcoming_edit:${dropId}`).setLabel('Edit').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`upcoming_delete:${dropId}`).setLabel('Delete').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId(`upcoming_announce:${dropId}`).setLabel('Announce').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('back_upcoming').setLabel('Back').setStyle(ButtonStyle.Secondary)
  )
}
