import type { Interaction, ChatInputCommandInteraction, ButtonInteraction } from 'discord.js'
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

const pages = [
  {
    id: 'intro',
    embed: new EmbedBuilder()
      .setTitle('How to Use Cinco Bot')
      .setColor(0x121417)
      .setDescription([
        'This bot lets you **add products to the website** and **announce them in Discord**.',
        '',
        'Everything you do here automatically updates the website. No coding needed.',
        '',
        'Use the buttons below to learn each topic!',
      ].join('\n'))
  },
  {
    id: 'add',
    embed: new EmbedBuilder()
      .setTitle('Adding a New Product')
      .setColor(0x121417)
      .setDescription([
        '**Step 1:** Type `/product add` and press Enter',
        '',
        '**Step 2:** A form pops up. Fill in:',
        '',
        '> **ID** - A short name for the URL (no spaces!)',
        '> Example: `hysteric-hoodie` or `raf-simons-jacket`',
        '',
        '> **Name** - The full product name',
        '> Example: `Hysteric Glamour Devil Hoodie`',
        '',
        '> **Price** - Just the number in USD',
        '> Example: `45` (not $45)',
        '',
        '> **Image URL** - Link to the product image',
        '> Upload to imgur.com first, then paste the link',
        '',
        '> **Product URL** - The Weidian/Taobao link where people buy it',
        '',
        '**Step 3:** Click Submit. Done! It\'s on the website now.',
      ].join('\n'))
  },
  {
    id: 'edit',
    embed: new EmbedBuilder()
      .setTitle('Editing a Product')
      .setColor(0x121417)
      .setDescription([
        'Made a mistake? Need to change the price? Easy fix.',
        '',
        '**Step 1:** Type `/product edit`',
        '',
        '**Step 2:** Start typing the product name in the `id` field',
        '> A dropdown appears - click the product you want',
        '',
        '**Step 3:** The form shows current values',
        '> Change what you need, leave the rest',
        '',
        '**Step 4:** Click Submit. Website updates instantly.',
      ].join('\n'))
  },
  {
    id: 'delete',
    embed: new EmbedBuilder()
      .setTitle('Deleting a Product')
      .setColor(0x121417)
      .setDescription([
        'Need to remove something from the shop?',
        '',
        '**Step 1:** Type `/product delete`',
        '',
        '**Step 2:** Start typing the product name in the `id` field',
        '> Click it from the dropdown',
        '',
        '**Step 3:** Confirm deletion',
        '',
        '**Warning:** This is permanent! The product is gone from the website.',
      ].join('\n'))
  },
  {
    id: 'announce',
    embed: new EmbedBuilder()
      .setTitle('Announcing Products')
      .setColor(0x121417)
      .setDescription([
        'Want to tell everyone about a new product? Post it to a channel!',
        '',
        '**Step 1:** Type `/announce`',
        '',
        '**Step 2:** Fill in the options:',
        '',
        '> **type** - Select `Product`',
        '',
        '> **id** - Start typing, pick from dropdown',
        '',
        '> **channel** - Pick where to post (like #new-drops)',
        '> Leave empty to post in current channel',
        '',
        '**Step 3:** Press Enter',
        '',
        'The bot posts a nice embed with the image, price, and a link to buy!',
      ].join('\n'))
  },
  {
    id: 'drops',
    embed: new EmbedBuilder()
      .setTitle('Teasing Upcoming Releases')
      .setColor(0x121417)
      .setDescription([
        'Want to hype something before it\'s ready? Use drops!',
        '',
        '**Adding a drop:**',
        '`/drop add` → Fill the form with a teaser hint',
        '',
        '**Announcing the tease:**',
        '`/announce type:Drop id:your-drop channel:#hype`',
        '',
        '**When it releases:**',
        '1. `/drop delete` to remove the tease',
        '2. `/product add` to add the real product',
        '3. `/announce type:Product` to announce the release!',
      ].join('\n'))
  },
  {
    id: 'view',
    embed: new EmbedBuilder()
      .setTitle('Viewing Products & Drops')
      .setColor(0x121417)
      .setDescription([
        '**See all products:**',
        '```/product list```',
        'Shows everything in the shop with buttons to page through.',
        '',
        '**See one product:**',
        '```/product view```',
        'Then pick from dropdown. Shows all details.',
        '',
        '**See all drops:**',
        '```/drop list```',
        '',
        '**See one drop:**',
        '```/drop view```',
      ].join('\n'))
  },
  {
    id: 'tips',
    embed: new EmbedBuilder()
      .setTitle('Tips & Tricks')
      .setColor(0x121417)
      .setDescription([
        '**IDs must be unique**',
        'Can\'t have two products with the same ID.',
        '',
        '**IDs can\'t have spaces**',
        'Use dashes: `cool-jacket` not `cool jacket`',
        '',
        '**Images should be on Imgur**',
        'Go to imgur.com → upload → copy the direct link',
        'It should end in .jpg or .png',
        '',
        '**Autocomplete is your friend**',
        'When picking a product/drop, just start typing.',
        'The bot suggests matches - click to select.',
        '',
        '**Something wrong?**',
        'Type `/sync` to refresh everything from storage.',
      ].join('\n'))
  },
  {
    id: 'ref',
    embed: new EmbedBuilder()
      .setTitle('Quick Reference')
      .setColor(0x121417)
      .setDescription([
        '**Products**',
        '`/product add` - Add new product',
        '`/product edit` - Change a product',
        '`/product delete` - Remove a product',
        '`/product list` - See all products',
        '`/product view` - See one product',
        '',
        '**Drops (upcoming releases)**',
        '`/drop add` - Add a tease',
        '`/drop delete` - Remove a tease',
        '`/drop list` - See all drops',
        '`/drop view` - See one drop',
        '',
        '**Announcements**',
        '`/announce type:Product id:xxx` - Post product',
        '`/announce type:Drop id:xxx` - Post drop',
        '',
        '**Help**',
        '`/tutorial` - This guide',
        '`/sync` - Fix sync issues',
      ].join('\n'))
  },
]

function buildButtons(currentIndex: number): ActionRowBuilder<ButtonBuilder>[] {
  const topicButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('tutorial_add')
      .setLabel('Add Product')
      .setStyle(currentIndex === 1 ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('tutorial_edit')
      .setLabel('Edit')
      .setStyle(currentIndex === 2 ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('tutorial_delete')
      .setLabel('Delete')
      .setStyle(currentIndex === 3 ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('tutorial_announce')
      .setLabel('Announce')
      .setStyle(currentIndex === 4 ? ButtonStyle.Primary : ButtonStyle.Secondary),
  )
  
  const moreButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('tutorial_drops')
      .setLabel('Drops')
      .setStyle(currentIndex === 5 ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('tutorial_view')
      .setLabel('View')
      .setStyle(currentIndex === 6 ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('tutorial_tips')
      .setLabel('Tips')
      .setStyle(currentIndex === 7 ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('tutorial_ref')
      .setLabel('Commands')
      .setStyle(currentIndex === 8 ? ButtonStyle.Primary : ButtonStyle.Secondary),
  )
  
  return [topicButtons, moreButtons]
}

export async function handleTutorial(interaction: Interaction): Promise<void> {
  if (!interaction.isChatInputCommand()) return
  const cmd = interaction as ChatInputCommandInteraction
  
  const isPrivate = cmd.options.getBoolean('private') ?? false
  
  await cmd.reply({ 
    embeds: [pages[0].embed],
    components: buildButtons(0),
    ephemeral: isPrivate 
  })
}

export async function handleTutorialButton(interaction: ButtonInteraction): Promise<void> {
  const pageId = interaction.customId.replace('tutorial_', '')
  const pageIndex = pages.findIndex(p => p.id === pageId)
  
  if (pageIndex === -1) {
    await interaction.reply({ content: 'Unknown page', ephemeral: true })
    return
  }
  
  await interaction.update({
    embeds: [pages[pageIndex].embed],
    components: buildButtons(pageIndex),
  })
}
