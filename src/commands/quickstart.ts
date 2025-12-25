import type { Interaction, ChatInputCommandInteraction, ButtonInteraction } from 'discord.js'
import { isOwner } from '../utils/permissions.js'
import { 
  ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder,
  ButtonBuilder, ButtonStyle, EmbedBuilder
} from 'discord.js'
import { upsertServerConfig, getServerConfig, setPermission, getPermissions } from '../database/models.js'
import { encrypt, decrypt } from '../services/crypto.js'

const setupSessions = new Map<string, {
  token?: string
  gistId?: string
  step: number
  userId: string
}>()

export async function handleQuickstart(interaction: Interaction): Promise<void> {
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
  
  setupSessions.set(cmd.guildId, { step: 1, userId: cmd.user.id })
  
  const embed = new EmbedBuilder()
    .setColor(0x121417)
    .setTitle('Server Setup')
    .setDescription([
      'Configure this server to connect with your shop website.',
      '',
      '**What you need:**',
      '1. GitHub Personal Access Token with `gist` scope',
      '2. Gist ID (from your data.json gist URL)',
      '',
      '**Optional:**',
      '3. Admin users/roles who can manage products',
      '',
      'Click **Start** to begin.',
    ].join('\n'))
  
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('quickstart_start')
      .setLabel('Start Setup')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('quickstart_cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Secondary),
  )
  
  await cmd.reply({ embeds: [embed], components: [row], ephemeral: true })
}

export async function handleQuickstartButton(interaction: ButtonInteraction): Promise<void> {
  const { customId, guildId } = interaction
  
  if (!guildId) return
  
  const session = setupSessions.get(guildId)
  if (!session || session.userId !== interaction.user.id) {
    await interaction.reply({ content: 'Session expired. Run /quickstart again.', ephemeral: true })
    return
  }
  
  if (customId === 'quickstart_cancel') {
    setupSessions.delete(guildId)
    await interaction.update({ content: 'Setup cancelled.', embeds: [], components: [] })
    return
  }
  
  if (customId === 'quickstart_start') {
    const modal = new ModalBuilder()
      .setCustomId('quickstart_token')
      .setTitle('Step 1: GitHub Token')
    
    const tokenInput = new TextInputBuilder()
      .setCustomId('token')
      .setLabel('GitHub Personal Access Token')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('ghp_xxxxxxxxxxxxxxxxxxxx')
      .setRequired(true)
    
    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(tokenInput)
    )
    
    await interaction.showModal(modal)
    return
  }
  
  if (customId === 'quickstart_gist') {
    const modal = new ModalBuilder()
      .setCustomId('quickstart_gist')
      .setTitle('Step 2: Gist ID')
    
    const gistInput = new TextInputBuilder()
      .setCustomId('gist_id')
      .setLabel('Gist ID (from URL)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('abc123def456789...')
      .setRequired(true)
    
    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(gistInput)
    )
    
    await interaction.showModal(modal)
    return
  }
  
  if (customId === 'quickstart_add_admin') {
    const modal = new ModalBuilder()
      .setCustomId('quickstart_admin')
      .setTitle('Add Admin')
    
    const userInput = new TextInputBuilder()
      .setCustomId('user_id')
      .setLabel('User ID (right-click user > Copy ID)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('123456789012345678')
      .setRequired(false)
    
    const roleInput = new TextInputBuilder()
      .setCustomId('role_id')
      .setLabel('Role ID (right-click role > Copy ID)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('123456789012345678')
      .setRequired(false)
    
    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(userInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(roleInput)
    )
    
    await interaction.showModal(modal)
    return
  }
  
  if (customId === 'quickstart_skip_admin' || customId === 'quickstart_done') {
    setupSessions.delete(guildId)
    
    const config = getServerConfig(guildId)
    const perms = getPermissions(guildId)
    
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('Setup Complete')
      .setDescription([
        'Your server is now connected.',
        '',
        `**Gist ID:** \`${config?.gist_id || 'Not set'}\``,
        `**Token:** ${config?.gist_token_encrypted ? 'Configured' : 'Not set'}`,
        `**Admins:** ${perms.filter(p => p.permission === 'admin').length}`,
        '',
        '**Next steps:**',
        '- `/product add` - Add products',
        '- `/drop add` - Add upcoming releases',
        '- `/sync` - Force refresh from gist',
        '- `/help` - See all commands',
      ].join('\n'))
    
    await interaction.update({ embeds: [embed], components: [] })
    return
  }
}

export async function handleQuickstartModal(interaction: Interaction): Promise<void> {
  if (!interaction.isModalSubmit()) return
  const { customId, guildId } = interaction
  
  if (!guildId) return
  
  const session = setupSessions.get(guildId)
  if (!session) {
    await interaction.reply({ content: 'Session expired. Run /quickstart again.', ephemeral: true })
    return
  }
  
  if (customId === 'quickstart_token') {
    const token = interaction.fields.getTextInputValue('token').trim()
    
    if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
      await interaction.reply({ 
        content: 'Invalid token format. Should start with `ghp_` or `github_pat_`', 
        ephemeral: true 
      })
      return
    }
    
    await interaction.deferUpdate()
    
    const testRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (!testRes.ok) {
      await interaction.editReply({ 
        content: 'Token validation failed. Make sure the token is valid and has `gist` scope.',
        embeds: [],
        components: []
      })
      return
    }
    
    session.token = token
    const encrypted = encrypt(token)
    upsertServerConfig(guildId, encrypted, null, null)
    
    const embed = new EmbedBuilder()
      .setColor(0x121417)
      .setTitle('Step 2: Gist ID')
      .setDescription([
        'Token verified.',
        '',
        'Now enter your Gist ID.',
        '',
        '**How to find it:**',
        '1. Go to gist.github.com',
        '2. Create or open your data.json gist',
        '3. Copy the ID from the URL:',
        '   `gist.github.com/username/`**`THIS_PART`**',
        '',
        'If you don\'t have a gist yet, create one with:',
        '```json',
        '{"products":[],"drops":[]}',
        '```',
      ].join('\n'))
    
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('quickstart_gist')
        .setLabel('Enter Gist ID')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('quickstart_cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary),
    )
    
    await interaction.editReply({ embeds: [embed], components: [row] })
    return
  }
  
  if (customId === 'quickstart_gist') {
    const gistId = interaction.fields.getTextInputValue('gist_id').trim()
    
    await interaction.deferUpdate()
    
    const config = getServerConfig(guildId)
    if (!config?.gist_token_encrypted) {
      await interaction.editReply({ 
        content: 'Token not found. Run /quickstart again.',
        embeds: [],
        components: []
      })
      return
    }
    
    const token = decrypt(config.gist_token_encrypted)
    
    const gistRes = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json'
      }
    })
    
    if (!gistRes.ok) {
      await interaction.editReply({ 
        content: `Gist not found or not accessible. Status: ${gistRes.status}\n\nMake sure:\n- The Gist ID is correct\n- Your token has access to this gist`,
        embeds: [],
        components: []
      })
      return
    }
    
    const gist = await gistRes.json() as { files: Record<string, { content: string }> }
    const file = Object.values(gist.files)[0]
    
    let data: Record<string, unknown>
    try {
      data = JSON.parse(file?.content || '{}')
    } catch {
      await interaction.editReply({ 
        content: 'Gist content is not valid JSON. Make sure it contains valid JSON like `{"products":[],"drops":[]}`',
        embeds: [],
        components: []
      })
      return
    }
    
    session.gistId = gistId
    upsertServerConfig(guildId, null, gistId, null)
    
    const productCount = Array.isArray(data.products) ? data.products.length : 0
    const dropsKey = Object.keys(data).find(k => k !== 'products' && Array.isArray(data[k]))
    const dropCount = dropsKey && Array.isArray(data[dropsKey]) ? data[dropsKey].length : 0
    
    const embed = new EmbedBuilder()
      .setColor(0x121417)
      .setTitle('Step 3: Permissions (Optional)')
      .setDescription([
        'Gist connected successfully.',
        '',
        `**Found:** ${productCount} products, ${dropCount} drops`,
        '',
        'You can now add admin users or roles who can manage products without being bot owner.',
        '',
        'Admins can:',
        '- Add/edit/delete products and drops',
        '- Post announcements',
        '- Sync data',
        '',
        'Skip this if you\'ll manage everything yourself.',
      ].join('\n'))
    
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('quickstart_add_admin')
        .setLabel('Add Admin')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('quickstart_skip_admin')
        .setLabel('Skip & Finish')
        .setStyle(ButtonStyle.Secondary),
    )
    
    await interaction.editReply({ embeds: [embed], components: [row] })
    return
  }
  
  if (customId === 'quickstart_admin') {
    const userId = interaction.fields.getTextInputValue('user_id').trim()
    const roleId = interaction.fields.getTextInputValue('role_id').trim()
    
    if (!userId && !roleId) {
      await interaction.reply({ content: 'Enter at least one user or role ID', ephemeral: true })
      return
    }
    
    await interaction.deferUpdate()
    
    const added: string[] = []
    
    if (userId && /^\d{17,20}$/.test(userId)) {
      setPermission(guildId, 'user', userId, 'admin', interaction.user.id)
      added.push(`User <@${userId}>`)
    }
    
    if (roleId && /^\d{17,20}$/.test(roleId)) {
      setPermission(guildId, 'role', roleId, 'admin', interaction.user.id)
      added.push(`Role <@&${roleId}>`)
    }
    
    const perms = getPermissions(guildId)
    const adminCount = perms.filter(p => p.permission === 'admin').length
    
    const embed = new EmbedBuilder()
      .setColor(0x121417)
      .setTitle('Admin Added')
      .setDescription([
        added.length ? `Added: ${added.join(', ')}` : 'No valid IDs provided',
        '',
        `**Total admins:** ${adminCount}`,
        '',
        'Add more admins or finish setup.',
      ].join('\n'))
    
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('quickstart_add_admin')
        .setLabel('Add Another')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('quickstart_done')
        .setLabel('Finish Setup')
        .setStyle(ButtonStyle.Success),
    )
    
    await interaction.editReply({ embeds: [embed], components: [row] })
    return
  }
}
