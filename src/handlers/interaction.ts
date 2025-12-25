import type { Interaction } from 'discord.js'
import { handleSetup } from '../commands/setup.js'
import { handleConfig } from '../commands/config.js'
import { handleProducts } from '../commands/products.js'
import { handleUpcoming } from '../commands/upcoming.js'
import { handleHelp } from '../commands/help.js'
import { handleAsk } from '../commands/ask.js'
import { handleModal } from './modal.js'
import { handleSelectMenu } from './selectMenu.js'
import { handleButton } from './button.js'

const commands: Record<string, (interaction: Interaction) => Promise<void>> = {
  setup: handleSetup,
  config: handleConfig,
  products: handleProducts,
  upcoming: handleUpcoming,
  help: handleHelp,
  ask: handleAsk,
}

export async function handleInteraction(interaction: Interaction): Promise<void> {
  if (interaction.isModalSubmit()) {
    try {
      await handleModal(interaction)
    } catch (err) {
      console.error('Modal error:', err)
      const message = err instanceof Error ? err.message : 'An error occurred'
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: message, ephemeral: true })
      } else {
        await interaction.reply({ content: message, ephemeral: true })
      }
    }
    return
  }
  
  if (interaction.isButton()) {
    try {
      await handleButton(interaction)
    } catch (err) {
      console.error('Button error:', err)
      const message = err instanceof Error ? err.message : 'An error occurred'
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: message, ephemeral: true })
      } else {
        await interaction.reply({ content: message, ephemeral: true })
      }
    }
    return
  }

  if (interaction.isStringSelectMenu()) {
    try {
      await handleSelectMenu(interaction)
    } catch (err) {
      console.error('Select menu error:', err)
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'An error occurred', ephemeral: true })
      } else {
        await interaction.reply({ content: 'An error occurred', ephemeral: true })
      }
    }
    return
  }
  
  if (!interaction.isChatInputCommand()) return
  
  const handler = commands[interaction.commandName]
  if (!handler) {
    await interaction.reply({ content: 'Unknown command', ephemeral: true })
    return
  }
  
  try {
    await handler(interaction)
  } catch (err) {
    console.error(`Error in /${interaction.commandName}:`, err)
    const message = err instanceof Error ? err.message : 'An error occurred'
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: message, ephemeral: true })
    } else {
      await interaction.reply({ content: message, ephemeral: true })
    }
  }
}
