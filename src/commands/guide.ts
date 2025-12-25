import type { Interaction, ChatInputCommandInteraction } from 'discord.js'
import { EmbedBuilder } from 'discord.js'

export async function handleGuide(interaction: Interaction): Promise<void> {
  if (!interaction.isChatInputCommand()) return
  const cmd = interaction as ChatInputCommandInteraction
  
  const isPrivate = cmd.options.getBoolean('private') ?? false
  
  const overview = new EmbedBuilder()
    .setTitle('Cinco Bot - Complete Guide')
    .setColor(0x121417)
    .setDescription([
      '**Cinco** manages products and drops for shop websites using GitHub Gist as storage.',
      '',
      'This guide covers everything. Scroll through all embeds below.',
    ].join('\n'))
  
  const setup = new EmbedBuilder()
    .setTitle('1. Initial Setup')
    .setColor(0x121417)
    .setDescription([
      '**Quick Setup (Recommended)**',
      '```/quickstart```',
      'Interactive wizard that guides you through:',
      '1. GitHub token entry (with gist scope)',
      '2. Gist ID configuration',
      '3. Admin user/role assignment',
      '',
      '**Manual Setup**',
      '```/setup token``` - Enter GitHub PAT (modal)',
      '```/setup gist id:<gist-id>``` - Set Gist ID',
      '```/setup view``` - Check current config',
      '',
      '**Requirements:**',
      '- GitHub Personal Access Token with `gist` scope',
      '- A Gist with `data.json` file containing `{"products":[],"drops":[]}`',
    ].join('\n'))
  
  const products = new EmbedBuilder()
    .setTitle('2. Product Management')
    .setColor(0x121417)
    .setDescription([
      '**View Products**',
      '```/product list``` - All products with pagination',
      '```/product view id:<id>``` - Single product details',
      '',
      '**Add Product**',
      '```/product add```',
      'Opens modal with fields:',
      '- **ID**: URL slug (e.g. `hysteric-hoodie`)',
      '- **Name**: Display name',
      '- **Price**: USD amount',
      '- **Image URL**: Product image (Imgur recommended)',
      '- **Product URL**: Weidian/Taobao/1688 link',
      '',
      '**Edit Product**',
      '```/product edit id:<id>```',
      'Opens modal pre-filled with current values.',
      '',
      '**Delete Product**',
      '```/product delete id:<id>```',
      'Permanent removal (no undo).',
    ].join('\n'))
  
  const drops = new EmbedBuilder()
    .setTitle('3. Drop Management')
    .setColor(0x121417)
    .setDescription([
      'Drops are upcoming/teased releases shown on `/upcoming` page.',
      '',
      '**View Drops**',
      '```/drop list``` - All drops',
      '```/drop view id:<id>``` - Single drop details',
      '',
      '**Add Drop**',
      '```/drop add```',
      'Opens modal with fields:',
      '- **ID**: Identifier',
      '- **Name**: Display name',
      '- **Brand**: Brand name',
      '- **Hint**: Teaser text',
      '',
      '**Delete Drop**',
      '```/drop delete id:<id>```',
      'Use when item releases (then add as product).',
    ].join('\n'))
  
  const announce = new EmbedBuilder()
    .setTitle('4. Announcements')
    .setColor(0x121417)
    .setDescription([
      'Post products/drops as rich embeds to Discord channels.',
      '',
      '**Post Product**',
      '```/announce type:Product id:<id> channel:#channel```',
      '',
      '**Post Drop**',
      '```/announce type:Drop id:<id> channel:#channel```',
      '',
      'If `channel` omitted, posts to current channel.',
      '',
      '**Embed includes:**',
      '- Product/drop image',
      '- Name, brand, price',
      '- Link to website product page',
    ].join('\n'))
  
  const permissions = new EmbedBuilder()
    .setTitle('5. Permissions')
    .setColor(0x121417)
    .setDescription([
      '**Permission Levels**',
      '',
      '**Owner** (hardcoded)',
      '- Full access, setup commands, manage all servers',
      '',
      '**Admin** (per-server)',
      '- CRUD products/drops',
      '- Post announcements',
      '- Sync data',
      '- Manage permissions',
      '',
      '**Allowed** (per-server)',
      '- View products/drops',
      '- Use help/guide/explain commands',
      '',
      '**Managing Permissions**',
      '```/config add level:Admin user:@user```',
      '```/config add level:Admin role:@role```',
      '```/config remove user:@user```',
      '```/config remove role:@role```',
      '```/config list``` - View all permissions',
    ].join('\n'))
  
  const workflow = new EmbedBuilder()
    .setTitle('6. Typical Workflows')
    .setColor(0x121417)
    .setDescription([
      '**Adding New Product**',
      '1. `/product add` → fill form',
      '2. `/announce type:Product id:new-item channel:#drops`',
      '3. Website updates automatically',
      '',
      '**Teasing Upcoming Release**',
      '1. `/drop add` → add with hint',
      '2. `/announce type:Drop id:mystery channel:#hype`',
      '',
      '**When Drop Releases**',
      '1. `/drop delete id:mystery`',
      '2. `/product add` → add as real product',
      '3. `/announce type:Product id:mystery`',
      '',
      '**Troubleshooting**',
      '```/sync``` - Force refresh from Gist',
      '```/setup view``` - Check config status',
    ].join('\n'))
  
  const commands = new EmbedBuilder()
    .setTitle('7. All Commands Reference')
    .setColor(0x121417)
    .setDescription([
      '**Setup**',
      '`/quickstart` - Full setup wizard',
      '`/setup token|gist|view` - Manual config',
      '',
      '**Products**',
      '`/product list|add|view|edit|delete`',
      '',
      '**Drops**',
      '`/drop list|add|view|delete`',
      '',
      '**Announcements**',
      '`/announce type:Product|Drop id: channel:`',
      '',
      '**Permissions**',
      '`/config add|remove|list`',
      '',
      '**Utility**',
      '`/sync` - Force refresh data',
      '`/help` - Quick command list',
      '`/explain <topic>` - Topic deep-dive',
      '`/demo` - Show examples (public/private)',
      '`/guide` - This comprehensive guide',
    ].join('\n'))
  
  const tips = new EmbedBuilder()
    .setTitle('8. Tips & Notes')
    .setColor(0x121417)
    .setDescription([
      '**IDs**',
      '- Use URL-friendly slugs: `hysteric-hoodie` not `Hysteric Hoodie`',
      '- IDs must be unique per type (products/drops)',
      '',
      '**Images**',
      '- Use Imgur for reliable hosting',
      '- Direct image URLs only (ending in .jpg, .png, etc)',
      '',
      '**Storage**',
      '- Data stored in GitHub Gist (free, persistent)',
      '- Changes sync to website automatically',
      '- `/sync` if website seems stale',
      '',
      '**Autocomplete**',
      '- Product/drop IDs autocomplete as you type',
      '- Start typing and select from dropdown',
    ].join('\n'))
  
  await cmd.reply({ 
    embeds: [overview, setup, products, drops, announce, permissions, workflow, commands, tips], 
    ephemeral: isPrivate 
  })
}
