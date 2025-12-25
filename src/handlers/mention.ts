import type { Message, TextChannel } from 'discord.js'
import { EmbedBuilder } from 'discord.js'
import { client } from '../client.js'
import { config } from '../config.js'
import { checkRateLimit } from '../utils/ratelimit.js'

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'

const SYSTEM_PROMPT = `You are Cinco Bot's help assistant. You help users understand how to use the Discord bot commands.
The user's question will be wrapped in <user_query> tags. Only answer the question inside these tags.

AVAILABLE COMMANDS:

PRODUCTS:
- /product add - Opens a form to add a new product. Fields: ID (url slug like "cool-jacket"), Name, Price (number only), Image URL, Product URL (Weidian/Taobao link)
- /product edit - Edit an existing product. Type the command, then start typing the product name to select it from dropdown. A form opens with current values to modify.
- /product delete - Remove a product permanently. Select from dropdown.
- /product list - See all products with pagination buttons
- /product view - See details of one product. Select from dropdown.

DROPS (upcoming/teased releases):
- /drop add - Add a teaser for upcoming release. Fields: ID, Name, Brand, Hint (teaser text)
- /drop delete - Remove a drop (use when item releases)
- /drop list - See all drops
- /drop view - See one drop's details

ANNOUNCEMENTS:
- /announce type:Product id:<product-id> channel:#channel - Post a product embed to a channel
- /announce type:Drop id:<drop-id> channel:#channel - Post a drop embed to a channel
- If channel is omitted, posts to current channel

UTILITIES:
- /sync - Force refresh data from storage (use if something seems wrong)
- /tutorial - Interactive guide with buttons
- /help - Quick command list

TIPS:
- IDs cannot have spaces, use dashes: "cool-jacket" not "cool jacket"
- IDs must be unique
- Images should be uploaded to imgur.com first
- When selecting products/drops, just start typing - autocomplete will suggest matches
- Changes automatically sync to the website

RESPONSE RULES:
1. Be concise and helpful
2. Always provide the exact command(s) needed
3. Explain what each part does if it's not obvious
4. If the question is unclear, ask for clarification
5. If asked about something outside the bot's features, say you can only help with Cinco Bot commands
6. Use Discord markdown formatting (backticks for commands, **bold** for emphasis)`

async function askAI(question: string): Promise<string> {
  const response = await fetch(NVIDIA_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.nvidiaApiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta/llama-4-maverick-17b-128e-instruct',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `<user_query>${question}</user_query>` }
      ],
      max_tokens: 512,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: false,
    }),
  })

  if (!response.ok) {
    throw new Error(`AI request failed: ${response.status}`)
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>
  }
  
  return data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.'
}

export async function handleMention(message: Message): Promise<void> {
  if (message.author.bot) return
  if (!client.user) return
  if (!message.mentions.has(client.user.id)) return
  
  const rateCheck = checkRateLimit(message.author.id)
  if (!rateCheck.allowed) {
    await message.reply({ content: `Slow down! Try again in ${rateCheck.remainingTime} seconds.` })
    return
  }
  
  const question = message.content
    .replace(/<@!?\d+>/g, '')
    .trim()
  
  if (!question) {
    await message.reply({
      content: 'Hey! Ask me anything about how to use this bot. For example:\n`@Cinco how do I add a product?`',
    })
    return
  }
  
  if (question.length > 500) {
    await message.reply({ content: 'Question too long. Keep it under 500 characters.' })
    return
  }
  
  const channel = message.channel as TextChannel
  if (channel.sendTyping) {
    await channel.sendTyping()
  }
  
  try {
    const answer = await askAI(question)
    
    const embed = new EmbedBuilder()
      .setTitle('Cinco Bot Help')
      .setColor(0x121417)
      .addFields(
        { name: 'Question', value: question.slice(0, 256) },
        { name: 'Answer', value: answer.slice(0, 1024) }
      )
    
    if (answer.length > 1024) {
      embed.addFields({ name: '\u200b', value: answer.slice(1024, 2048) })
    }
    
    await message.reply({ embeds: [embed] })
  } catch (err) {
    console.error('AI error:', err)
    await message.reply({
      content: 'Sorry, I couldn\'t process your question. Try `/tutorial` for the interactive guide.',
    })
  }
}
