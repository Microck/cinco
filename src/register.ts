import { REST, Routes, SlashCommandBuilder } from 'discord.js'
import 'dotenv/config'

const token = process.env.DISCORD_TOKEN!
const clientId = process.env.DISCORD_CLIENT_ID!

const commands = [
  new SlashCommandBuilder()
    .setName('products')
    .setDescription('Manage products'),

  new SlashCommandBuilder()
    .setName('upcoming')
    .setDescription('Manage upcoming releases'),

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
      sub.setName('baseurl').setDescription('Set website base URL')
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
    .setName('help')
    .setDescription('Show available commands'),

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
