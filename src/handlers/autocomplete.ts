import type { AutocompleteInteraction } from 'discord.js'
import { getServerConfig } from '../database/models.js'
import { fetchGistData } from '../services/gist.js'
import { detectDropsKey } from '../schema/detector.js'

export async function handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
  const { guildId, commandName } = interaction
  
  if (!guildId) return
  
  const config = getServerConfig(guildId)
  if (!config?.gist_id || !config?.gist_token_encrypted) {
    await interaction.respond([])
    return
  }
  
  const focused = interaction.options.getFocused(true)
  if (focused.name !== 'id') {
    await interaction.respond([])
    return
  }
  
  try {
    const data = await fetchGistData(guildId)
    const query = focused.value.toLowerCase()
    
    let items: Record<string, unknown>[] = []
    
    if (commandName === 'product' || (commandName === 'announce' && interaction.options.getString('type') === 'product')) {
      items = data.products || []
    } else {
      const dropsKey = detectDropsKey(data)
      items = (data[dropsKey] || []) as Record<string, unknown>[]
    }
    
    const matches = items
      .filter(item => {
        const id = String(item.id || '').toLowerCase()
        const name = String(item.name || '').toLowerCase()
        return id.includes(query) || name.includes(query)
      })
      .slice(0, 25)
      .map(item => ({
        name: `${item.name || item.id}`,
        value: String(item.id),
      }))
    
    await interaction.respond(matches)
  } catch {
    await interaction.respond([])
  }
}
