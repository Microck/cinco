import { REST, Routes, SlashCommandBuilder, ChannelType } from 'discord.js'
import 'dotenv/config'

const token = process.env.DISCORD_TOKEN!
const clientId = process.env.DISCORD_CLIENT_ID!

const commands = [
  new SlashCommandBuilder()
    .setName('quickstart')
    .setDescription('Full setup wizard - token, gist, and admin in one go (owner only)'),

  new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configure server (owner only)')
    .addSubcommand(sub =>
      sub.setName('token').setDescription('Set GitHub Gist token')
    )
    .addSubcommand(sub =>
      sub.setName('gist').setDescription('Set Gist ID')
        .addStringOption(opt => opt.setName('id').setDescription('Gist ID').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('baseurl').setDescription('Set website base URL (e.g., https://bdss.club)')
        .addStringOption(opt => opt.setName('url').setDescription('Base URL').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('view').setDescription('View current config')
    ),

  new SlashCommandBuilder()
    .setName('config')
    .setDescription('Manage permissions')
    .addSubcommand(sub =>
      sub.setName('add').setDescription('Add permission')
        .addStringOption(opt => 
          opt.setName('level').setDescription('Permission level').setRequired(true)
            .addChoices({ name: 'Admin', value: 'admin' }, { name: 'Allowed', value: 'allowed' })
        )
        .addUserOption(opt => opt.setName('user').setDescription('User to grant'))
        .addRoleOption(opt => opt.setName('role').setDescription('Role to grant'))
    )
    .addSubcommand(sub =>
      sub.setName('remove').setDescription('Remove permission')
        .addUserOption(opt => opt.setName('user').setDescription('User'))
        .addRoleOption(opt => opt.setName('role').setDescription('Role'))
    )
    .addSubcommand(sub =>
      sub.setName('list').setDescription('List permissions')
    ),

  new SlashCommandBuilder()
    .setName('product')
    .setDescription('Manage products')
    .addSubcommand(sub => sub.setName('list').setDescription('List all products'))
    .addSubcommand(sub => sub.setName('add').setDescription('Add a product'))
    .addSubcommand(sub =>
      sub.setName('view').setDescription('View product')
        .addStringOption(opt => opt.setName('id').setDescription('Product ID (optional - omit for menu)').setRequired(false).setAutocomplete(true))
    )
    .addSubcommand(sub =>
      sub.setName('edit').setDescription('Edit a product')
        .addStringOption(opt => opt.setName('id').setDescription('Product ID (optional - omit for menu)').setRequired(false).setAutocomplete(true))
    )
    .addSubcommand(sub =>
      sub.setName('delete').setDescription('Delete product')
        .addStringOption(opt => opt.setName('id').setDescription('Product ID (optional - omit for menu)').setRequired(false).setAutocomplete(true))
    ),

  new SlashCommandBuilder()
    .setName('drop')
    .setDescription('Manage drops')
    .addSubcommand(sub => sub.setName('list').setDescription('List all drops'))
    .addSubcommand(sub => sub.setName('add').setDescription('Add a drop'))
    .addSubcommand(sub =>
      sub.setName('view').setDescription('View drop')
        .addStringOption(opt => opt.setName('id').setDescription('Drop ID (optional - omit for menu)').setRequired(false).setAutocomplete(true))
    )
    .addSubcommand(sub =>
      sub.setName('delete').setDescription('Delete drop')
        .addStringOption(opt => opt.setName('id').setDescription('Drop ID (optional - omit for menu)').setRequired(false).setAutocomplete(true))
    ),

  new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Announce product/drop to channel')
    .addStringOption(opt =>
      opt.setName('type').setDescription('Type').setRequired(true)
        .addChoices({ name: 'Product', value: 'product' }, { name: 'Drop', value: 'drop' })
    )
    .addStringOption(opt => opt.setName('id').setDescription('ID').setRequired(true).setAutocomplete(true))
    .addChannelOption(opt => 
      opt.setName('channel').setDescription('Target channel')
        .addChannelTypes(ChannelType.GuildText)
    ),

  new SlashCommandBuilder()
    .setName('sync')
    .setDescription('Force sync from Gist'),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show available commands'),

  new SlashCommandBuilder()
    .setName('explain')
    .setDescription('Learn how to use the bot')
    .addStringOption(opt =>
      opt.setName('topic')
        .setDescription('What to learn about')
        .addChoices(
          { name: 'Products', value: 'products' },
          { name: 'Drops', value: 'drops' },
          { name: 'Announcements', value: 'announce' },
          { name: 'Permissions', value: 'permissions' },
          { name: 'Workflow', value: 'workflow' },
        )
    ),

  new SlashCommandBuilder()
    .setName('demo')
    .setDescription('Show all commands with examples')
    .addBooleanOption(opt =>
      opt.setName('private')
        .setDescription('Only you can see it (default: public)')
    ),

  new SlashCommandBuilder()
    .setName('guide')
    .setDescription('Complete guide to everything in the bot (for admins)')
    .addBooleanOption(opt =>
      opt.setName('private')
        .setDescription('Only you can see it (default: public)')
    ),

  new SlashCommandBuilder()
    .setName('tutorial')
    .setDescription('How to add products and announce them (for staff)')
    .addBooleanOption(opt =>
      opt.setName('private')
        .setDescription('Only you can see it (default: public)')
    ),

  new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask how to do something (AI-powered help)')
    .addStringOption(opt =>
      opt.setName('question')
        .setDescription('What do you want to know?')
        .setRequired(true)
    ),
]

const rest = new REST().setToken(token)

async function main() {
  console.log('Registering commands...')
  
  await rest.put(Routes.applicationCommands(clientId), {
    body: commands.map(c => c.toJSON()),
  })
  
  console.log('Done!')
}

main().catch(console.error)
