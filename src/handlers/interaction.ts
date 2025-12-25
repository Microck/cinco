import type { Interaction } from 'discord.js'
import { handleSetup } from '../commands/setup.js'
import { handleConfig } from '../commands/config.js'
import { handleProduct } from '../commands/product.js'
import { handleDrop } from '../commands/drop.js'
import { handleAnnounce } from '../commands/announce.js'
import { handleSync } from '../commands/sync.js'
import { handleHelp } from '../commands/help.js'
import { handleExplain } from '../commands/explain.js'
import { handleDemo } from '../commands/demo.js'
import { handleGuide } from '../commands/guide.js'
import { handleTutorial, handleTutorialButton } from '../commands/tutorial.js'
import { handleAsk } from '../commands/ask.js'
import { handleQuickstart, handleQuickstartButton, handleQuickstartModal } from '../commands/quickstart.js'
import { handleModal } from './modal.js'
import { handleAutocomplete } from './autocomplete.js'
import { handleSelectMenu } from './selectMenu.js'

const commands: Record<string, (interaction: Interaction) => Promise<void>> = {
  quickstart: handleQuickstart,
  setup: handleSetup,
  config: handleConfig,
  product: handleProduct,
  drop: handleDrop,
  announce: handleAnnounce,
  sync: handleSync,
  help: handleHelp,
  explain: handleExplain,
  demo: handleDemo,
  guide: handleGuide,
  tutorial: handleTutorial,
  ask: handleAsk,
}

export async function handleInteraction(interaction: Interaction): Promise<void> {
  if (interaction.isModalSubmit()) {
    const isQuickstartModal = interaction.customId.startsWith('quickstart_')
    try {
      if (isQuickstartModal) {
        await handleQuickstartModal(interaction)
      } else {
        await handleModal(interaction)
      }
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
    if (interaction.customId.startsWith('quickstart_')) {
      try {
        await handleQuickstartButton(interaction)
      } catch (err) {
        console.error('Button error:', err)
        const message = err instanceof Error ? err.message : 'An error occurred'
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: message, ephemeral: true })
        } else {
          await interaction.reply({ content: message, ephemeral: true })
        }
      }
    } else if (interaction.customId.startsWith('tutorial_')) {
      try {
        await handleTutorialButton(interaction)
      } catch (err) {
        console.error('Button error:', err)
        const message = err instanceof Error ? err.message : 'An error occurred'
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: message, ephemeral: true })
        } else {
          await interaction.reply({ content: message, ephemeral: true })
        }
      }
    }
    return
  }
  
  if (interaction.isAutocomplete()) {
    try {
      await handleAutocomplete(interaction)
    } catch (err) {
      console.error('Autocomplete error:', err)
    }
    return
  }

  if (interaction.isStringSelectMenu()) {
    try {
      await handleSelectMenu(interaction)
    } catch (err) {
      console.error('Select menu error:', err)
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'An error occurred while processing selection', ephemeral: true })
      } else {
        await interaction.reply({ content: 'An error occurred while processing selection', ephemeral: true })
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
