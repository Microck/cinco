import type { Interaction, ChatInputCommandInteraction } from 'discord.js'
import { EmbedBuilder } from 'discord.js'
import { hasPermission, isOwner } from '../utils/permissions.js'

export async function handleDemo(interaction: Interaction): Promise<void> {
  if (!interaction.isChatInputCommand()) return
  const cmd = interaction as ChatInputCommandInteraction
  
  if (!cmd.guildId) {
    await cmd.reply({ content: 'Server only', ephemeral: true })
    return
  }
  
  const canDemo = isOwner(cmd.user.id) || hasPermission(cmd.guildId, cmd.user.id, cmd.member, 'admin')
  if (!canDemo) {
    await cmd.reply({ content: 'Admin only', ephemeral: true })
    return
  }

  const isPrivate = cmd.options.getBoolean('private') ?? false

  const embed = new EmbedBuilder()
    .setTitle('Cinco Bot Commands')
    .setColor(0x121417)
    .setDescription('Quick reference for all admin commands')
    .addFields(
      {
        name: 'Products',
        value: [
          '`/product list` - View all products',
          '`/product add` - Add new product',
          '`/product view id:hysteric-hoodie` - View details',
          '`/product delete id:hysteric-hoodie` - Remove',
        ].join('\n'),
        inline: false,
      },
      {
        name: 'Drops',
        value: [
          '`/drop list` - View upcoming releases',
          '`/drop add` - Add new drop',
          '`/drop view id:mystery-drop` - View details',
          '`/drop delete id:mystery-drop` - Remove',
        ].join('\n'),
        inline: false,
      },
      {
        name: 'Announcements',
        value: [
          '`/announce type:Product id:hysteric-hoodie`',
          '`/announce type:Drop id:mystery-drop channel:#releases`',
        ].join('\n'),
        inline: false,
      },
      {
        name: 'Permissions',
        value: [
          '`/config add level:Admin user:@someone`',
          '`/config add level:Admin role:@Staff`',
          '`/config remove user:@someone`',
          '`/config list` - View all permissions',
        ].join('\n'),
        inline: false,
      },
      {
        name: 'Utilities',
        value: [
          '`/sync` - Force refresh from storage',
          '`/help` - Command list',
          '`/explain topic:workflow` - Detailed guides',
        ].join('\n'),
        inline: false,
      },
    )
    .setFooter({ text: 'Replace placeholder IDs with actual product/drop IDs' })

  await cmd.reply({ embeds: [embed], ephemeral: isPrivate })
}
