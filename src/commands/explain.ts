import type { Interaction, ChatInputCommandInteraction } from 'discord.js'
import { EmbedBuilder } from 'discord.js'

export async function handleExplain(interaction: Interaction): Promise<void> {
  if (!interaction.isChatInputCommand()) return
  const cmd = interaction as ChatInputCommandInteraction
  
  const topic = cmd.options.getString('topic')
  
  if (!topic) {
    const embed = new EmbedBuilder()
      .setTitle('Cinco Bot Guide')
      .setColor(0x121417)
      .setDescription([
        'Cinco manages products and drops for the shop website.',
        '',
        '**Topics** (use `/explain <topic>`):\n',
        '`products` - How to add, view, and manage products',
        '`drops` - How to manage upcoming releases',
        '`announce` - How to post products/drops to channels',
        '`permissions` - Who can do what',
        '`workflow` - Typical daily workflow',
      ].join('\n'))
    
    await cmd.reply({ embeds: [embed], ephemeral: true })
    return
  }
  
  const embeds: Record<string, EmbedBuilder> = {
    products: new EmbedBuilder()
      .setTitle('Products')
      .setColor(0x121417)
      .setDescription([
        '**List all products**',
        '```/product list```',
        '',
        '**Add a product**',
        '```/product add```',
        'Opens a form with fields:',
        '- ID (url slug, e.g. `hysteric-hoodie`)',
        '- Name',
        '- Price (USD)',
        '- Image URL',
        '- Product URL (Weidian/Taobao link)',
        '',
        '**View product details**',
        '```/product view <id>```',
        'Shows all info about a product.',
        '',
        '**Delete a product**',
        '```/product delete <id>```',
        'Removes from the shop permanently.',
        '',
        'Changes sync to the website automatically.',
      ].join('\n')),
    
    drops: new EmbedBuilder()
      .setTitle('Drops (Upcoming Releases)')
      .setColor(0x121417)
      .setDescription([
        '**List all drops**',
        '```/drop list```',
        '',
        '**Add a drop**',
        '```/drop add```',
        'Opens a form with fields:',
        '- ID',
        '- Name',
        '- Brand',
        '- Hint/Description',
        '',
        '**View drop details**',
        '```/drop view <id>```',
        '',
        '**Delete a drop**',
        '```/drop delete <id>```',
        '',
        'Drops show on the /upcoming page until released.',
      ].join('\n')),
    
    announce: new EmbedBuilder()
      .setTitle('Announcements')
      .setColor(0x121417)
      .setDescription([
        '**Post a product to a channel**',
        '```/announce type:Product id:hysteric-hoodie channel:#drops```',
        '',
        '**Post a drop to a channel**',
        '```/announce type:Drop id:upcoming-item channel:#announcements```',
        '',
        'If no channel specified, posts to current channel.',
        '',
        'The bot creates a nice embed with:',
        '- Product/drop image',
        '- Name, brand, price',
        '- Link to product page',
      ].join('\n')),
    
    permissions: new EmbedBuilder()
      .setTitle('Permissions')
      .setColor(0x121417)
      .setDescription([
        '**Three levels:**',
        '',
        '**Owner** (bot owner only)',
        '- Full access to everything',
        '- Can setup servers, manage tokens',
        '',
        '**Admin** (per-server)',
        '- Add/edit/delete products and drops',
        '- Post announcements',
        '- Sync data',
        '- Manage other users\' permissions',
        '',
        '**Allowed** (per-server)',
        '- View products and drops',
        '- Use `/help` and `/explain`',
        '',
        '**Grant admin to someone:**',
        '```/config add level:Admin user:@someone```',
        '',
        '**Grant admin to a role:**',
        '```/config add level:Admin role:@Moderators```',
      ].join('\n')),
    
    workflow: new EmbedBuilder()
      .setTitle('Daily Workflow')
      .setColor(0x121417)
      .setDescription([
        '**Adding a new product:**',
        '1. `/product add` - fill out the form',
        '2. `/announce type:Product id:new-item` - post to Discord',
        '3. Check the website - it updates automatically',
        '',
        '**Teasing an upcoming release:**',
        '1. `/drop add` - add with hint text',
        '2. `/announce type:Drop id:mystery-item` - hype it up',
        '',
        '**When a drop releases:**',
        '1. `/drop delete id:mystery-item` - remove from upcoming',
        '2. `/product add` - add as real product',
        '3. `/announce type:Product id:mystery-item` - announce release',
        '',
        '**Something wrong?**',
        '- `/sync` - force refresh data from storage',
        '- `/product delete` then `/product add` - recreate item',
      ].join('\n')),
  }
  
  const embed = embeds[topic]
  if (!embed) {
    await cmd.reply({ 
      content: `Unknown topic: \`${topic}\`. Try: products, drops, announce, permissions, workflow`, 
      ephemeral: true 
    })
    return
  }
  
  await cmd.reply({ embeds: [embed], ephemeral: true })
}
