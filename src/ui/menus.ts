import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } from 'discord.js'

export function buildProductSelectMenu(products: Record<string, unknown>[], action: string): ActionRowBuilder<StringSelectMenuBuilder> {
  const items = products.slice(0, 25)
  
  const select = new StringSelectMenuBuilder()
    .setCustomId(`product_select:${action}`)
    .setPlaceholder('Select a product...')
    .addOptions(
      items.map((p) => {
        const id = String(p.id || 'unknown')
        const name = String(p.name || id)
        const price = p.price ? `$${p.price}` : ''
        
        return new StringSelectMenuOptionBuilder()
          .setLabel(name.substring(0, 100))
          .setDescription(`${price} (ID: ${id})`.substring(0, 100))
          .setValue(id)
      })
    )

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)
}

export function buildUpcomingSelectMenu(drops: Record<string, unknown>[], action: string): ActionRowBuilder<StringSelectMenuBuilder> {
  const items = drops.slice(0, 25)
  
  const select = new StringSelectMenuBuilder()
    .setCustomId(`upcoming_select:${action}`)
    .setPlaceholder('Select an item...')
    .addOptions(
      items.map((d) => {
        const id = String(d.id || 'unknown')
        const name = String(d.name || id)
        const status = d.status ? `[${d.status}]` : ''
        
        return new StringSelectMenuOptionBuilder()
          .setLabel(name.substring(0, 100))
          .setDescription(`${status} (ID: ${id})`.substring(0, 100))
          .setValue(id)
      })
    )

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)
}
