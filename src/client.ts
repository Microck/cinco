import { Client, GatewayIntentBits, Events, ActivityType } from 'discord.js'
import { createServer } from 'http'
import { config } from './config.js'

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

let startTime: number

client.once(Events.ClientReady, (c) => {
  startTime = Date.now()
  console.log(`Ready as ${c.user.tag}`)
  console.log(`Serving ${c.guilds.cache.size} guilds`)
  
  c.user.setPresence({
    activities: [{
      name: 'micr.dev',
      type: ActivityType.Watching,
    }],
    status: 'online',
  })
  
  startHealthServer()
})

function startHealthServer() {
  const server = createServer((req, res) => {
    if (req.url === '/health') {
      const uptime = Math.floor((Date.now() - startTime) / 1000)
      const guilds = client.guilds.cache.size
      const ping = client.ws.ping
      
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        status: 'ok',
        uptime,
        guilds,
        ping,
        ready: client.isReady(),
      }))
    } else {
      res.writeHead(404)
      res.end()
    }
  })
  
  server.listen(config.monitorPort, () => {
    console.log(`Health server on port ${config.monitorPort}`)
  })
}

export async function startClient(): Promise<void> {
  await client.login(config.discord.token)
}
