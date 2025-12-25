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
    .setColor(0x2F3136)
  
  const commands = [
    '`/help` - Show this message',
    '`/ask <question>` - AI-powered help',
  ]
  
  if (isAdmin) {
    commands.push(
      '',
      '**Inventory**',
      '`/products` - Manage products (add, edit, delete, announce)',
      '`/upcoming` - Manage upcoming releases',
      '',
      '**Permissions**',
      '`/config add` - Add user/role permission',
      '`/config remove` - Remove permission',
      '`/config list` - List permissions',
    )
  }
  
  if (isOwner(cmd.user.id)) {
    commands.push(
      '',
      '**Setup (Owner)**',
      '`/setup token` - Set Gist token',
      '`/setup gist <id>` - Set Gist ID',
      '`/setup baseurl <url>` - Set website URL',
      '`/setup view` - View config',
    )
  }
  
  embed.setDescription(commands.join('\n'))
  
  await cmd.reply({ embeds: [embed], ephemeral: true })
}
