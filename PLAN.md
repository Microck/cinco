# Cinco Bot

Discord bot for managing shop websites via GitHub Gist.

## Status: COMPLETE

Interactive menu system with button-driven UI.

## Quick Start

```bash
npm install
cp .env.example .env   # edit with your values
npm run register       # register commands with discord
npm run dev            # or: docker compose up -d
```

## Commands

| Command | Description | Permission |
|---------|-------------|------------|
| `/products` | Manage products (buttons: Add, List, Sync) | Allowed |
| `/upcoming` | Manage upcoming releases (buttons: Add, List) | Allowed |
| `/setup token` | Set GitHub Gist token | Owner |
| `/setup gist <id>` | Set Gist ID | Owner |
| `/setup baseurl <url>` | Set website URL | Owner |
| `/setup view` | View config | Owner |
| `/config add` | Add permission | Admin |
| `/config remove` | Remove permission | Admin |
| `/config list` | List permissions | Admin |
| `/help` | Show commands | All |
| `/ask <question>` | AI help | All |

## User Flow

### Adding a Product
1. `/products` → Click [Add]
2. Fill modal: name, price, brand
3. "Add image?" → [Upload Image] or [Skip]
4. If upload: send image → auto-uploaded to Catbox
5. Product saved with [Announce] button

### Managing Products
1. `/products` → Click [List]
2. Select product from dropdown
3. View embed with [Edit] [Delete] [Announce] buttons

## Project Structure

```
src/
├── commands/
│   ├── products.ts    # /products command
│   ├── upcoming.ts    # /upcoming command
│   ├── setup.ts       # /setup command
│   ├── config.ts      # /config command
│   ├── help.ts        # /help command
│   └── ask.ts         # /ask command
├── handlers/
│   ├── interaction.ts # main router
│   ├── button.ts      # button clicks
│   ├── selectMenu.ts  # dropdown selections
│   └── modal.ts       # form submissions
├── services/
│   ├── gist.ts        # github gist api
│   ├── crypto.ts      # aes-256-gcm encryption
│   └── catbox.ts      # image upload
├── database/
│   ├── db.ts          # sqlite
│   └── models.ts      # server configs, permissions
├── schema/
│   └── detector.ts    # auto-detect json structure
└── ui/
    ├── embeds.ts      # embed builders
    └── menus.ts       # select menu builders
```

## Environment Variables

```env
DISCORD_TOKEN=         # bot token
DISCORD_CLIENT_ID=     # application id
ENCRYPTION_KEY=        # 64 char hex for aes-256
NVIDIA_API_KEY=        # optional, for /ask command
```

Generate encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Features

- Interactive button-based UI
- Image upload via Catbox.moe (no api key needed)
- Auto-detect gist schema
- Encrypted token storage
- Per-server permissions
- AI help via /ask
