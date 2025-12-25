import type { Interaction, ChatInputCommandInteraction } from 'discord.js'
import { hasPermission, isOwner } from '../utils/permissions.js'
import { EmbedBuilder } from 'discord.js'

export async function handleHelp(interaction: Interaction): Promise<void> {
  if (!interaction.isChatInputCommand()) return
  const cmd = interaction as ChatInputCommandInteraction
  
  const isAdmin = cmd.guildId && (
    isOwner(cmd.user.id) || 
    hasPermission(cmd.guildId, cmd.user.id, cmd.member, 'admin')
  )
  
  const embed = new EmbedBuilder()
    .setTitle('Cinco Bot')
    .setColor(0x121417)
  
  const commands = [
    '`/help` - Show this message',
  ]
  
  if (isAdmin) {
    commands.push(
      '`/product list` - List all products',
      '`/product add` - Add a product',
      '`/product view <id>` - View product details',
      '`/product delete <id>` - Delete a product',
      '`/drop list` - List all drops',
      '`/drop add` - Add a drop',
      '`/drop view <id>` - View drop details',
      '`/drop delete <id>` - Delete a drop',
      '`/announce <type> <id>` - Post to channel',
      '`/sync` - Force sync from Gist',
      '`/config add` - Add user/role permission',
      '`/config remove` - Remove permission',
      '`/config list` - List permissions',
    )
  }
  
  if (isOwner(cmd.user.id)) {
    commands.push(
      '`/setup token` - Set Gist token',
      '`/setup gist <id>` - Set Gist ID',
      '`/setup view` - View server config',
    )
  }
  
  embed.setDescription(commands.join('\n'))
  
  await cmd.reply({ embeds: [embed], ephemeral: true })
}
