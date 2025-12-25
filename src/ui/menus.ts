import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } from 'discord.js'

export function buildProductSelectMenu(products: any[], action: 'edit' | 'delete' | 'view'): ActionRowBuilder<StringSelectMenuBuilder> {
  const items = products.slice(0, 25)
  
  const select = new StringSelectMenuBuilder()
    .setCustomId(`product_select_${action}`)
    .setPlaceholder(`Select a product to ${action}...`)
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

export function buildDropSelectMenu(drops: any[], action: 'edit' | 'delete' | 'view'): ActionRowBuilder<StringSelectMenuBuilder> {
  const items = drops.slice(0, 25)
  
  const select = new StringSelectMenuBuilder()
    .setCustomId(`drop_select_${action}`)
    .setPlaceholder(`Select a drop to ${action}...`)
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
