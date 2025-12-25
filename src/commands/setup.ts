import type { Interaction, ChatInputCommandInteraction } from 'discord.js'
import { isOwner } from '../utils/permissions.js'
import { upsertServerConfig, getServerConfig } from '../database/models.js'
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js'

export async function handleSetup(interaction: Interaction): Promise<void> {
  if (!interaction.isChatInputCommand()) return
  const cmd = interaction as ChatInputCommandInteraction
  
  if (!cmd.guildId) {
    await cmd.reply({ content: 'This command can only be used in a server', ephemeral: true })
    return
  }
  
  if (!isOwner(cmd.user.id)) {
    await cmd.reply({ content: 'Only the bot owner can use this command', ephemeral: true })
    return
  }
  
  const sub = cmd.options.getSubcommand()
  
  if (sub === 'token') {
    const modal = new ModalBuilder()
      .setCustomId('setup_token')
      .setTitle('Set Gist Token')
    
    const tokenInput = new TextInputBuilder()
      .setCustomId('token')
      .setLabel('GitHub Personal Access Token (gist scope)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('ghp_...')
      .setRequired(true)
    
    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(tokenInput))
    await cmd.showModal(modal)
    return
  }
  
  if (sub === 'gist') {
    const gistId = cmd.options.getString('id', true)
    upsertServerConfig(cmd.guildId, null, gistId, null)
    await cmd.reply({ content: `Gist ID set: \`${gistId}\``, ephemeral: true })
    return
  }
  
  if (sub === 'view') {
    const config = getServerConfig(cmd.guildId)
    if (!config || !config.gist_id) {
      await cmd.reply({ content: 'No configuration found for this server', ephemeral: true })
      return
    }
    
    const hasToken = !!config.gist_token_encrypted
    await cmd.reply({
      content: [
        '**Server Configuration**',
        `Gist ID: \`${config.gist_id}\``,
        `Token: ${hasToken ? 'Set' : 'Not set'}`,
        `Schema: ${config.schema_profile || 'Auto-detect'}`,
      ].join('\n'),
      ephemeral: true,
    })
    return
  }
}
