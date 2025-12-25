import { startClient, client } from './client.js'
import { initDb } from './database/db.js'
import { handleInteraction } from './handlers/interaction.js'
import { handleMention } from './handlers/mention.js'
import { Events } from 'discord.js'

async function main() {
  console.log('Starting Cinco Bot...')
  
  initDb()
  console.log('Database initialized')
  
  client.on(Events.InteractionCreate, handleInteraction)
  client.on(Events.MessageCreate, handleMention)
  
  await startClient()
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
