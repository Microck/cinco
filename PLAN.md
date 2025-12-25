# Micr.Shop Discord Bot

Discord bot for managing shop websites that use GitHub Gist as storage.

## Status: IMPLEMENTATION COMPLETE

Build passes. Ready for testing.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
# Edit .env with your values

# 3. Register slash commands (once)
npm run register

# 4. Start bot
npm run dev     # Development with hot reload
npm start       # Production
```

## Docker Deployment

```bash
# 1. Create .env file
cp .env.example .env
# Edit .env with your values

# 2. Register commands first (locally)
npm install && npm run register

# 3. Build and run
docker compose up -d --build

# View logs
docker compose logs -f

# Stop
docker compose down
```

Data persists in `./data/bot.db` via volume mount.

## Requirements

### Core
- Multi-server support with per-server configuration
- Auto-detect any Gist JSON schema (products, drops, items, etc.)
- Dynamic embeds/modals based on detected schema
- No emojis, clean minimal design

### Permissions
- **Owner**: `501420209760894987` (hardcoded, full access everywhere)
- **Admin**: Per-server, can manage products/drops
- **Allowed**: Per-server, can use read commands
- Server-specific Gist tokens (encrypted with AES-256-GCM)

### Commands
| Command | Description | Permission |
|---------|-------------|------------|
| `/setup token` | Set GitHub Gist token (modal) | Owner |
| `/setup gist <id>` | Set Gist ID | Owner |
| `/setup view` | View server config | Owner |
| `/config add <level> [user] [role]` | Add permission | Owner/Admin |
| `/config remove [user] [role]` | Remove permission | Owner/Admin |
| `/config list` | List permissions | Owner/Admin |
| `/product list` | List all products | Admin |
| `/product add` | Add product (modal) | Admin |
| `/product view <id>` | View product | Admin |
| `/product delete <id>` | Delete product | Admin |
| `/drop list` | List all drops | Admin |
| `/drop add` | Add drop (modal) | Admin |
| `/drop view <id>` | View drop | Admin |
| `/drop delete <id>` | Delete drop | Admin |
| `/announce <type> <id> [channel]` | Post to channel | Admin |
| `/sync` | Force sync from Gist | Admin |
| `/help` | Show available commands | All |

## Project Structure

```
micr-shop-bot/
├── src/
│   ├── index.ts              # Entry point
│   ├── client.ts             # Discord client setup
│   ├── config.ts             # Environment config
│   ├── register.ts           # Slash command registration
│   ├── schema/
│   │   └── detector.ts       # Auto-detect JSON structure
│   ├── database/
│   │   ├── db.ts             # SQLite connection + migrations
│   │   └── models.ts         # Server configs, permissions, cache
│   ├── services/
│   │   ├── gist.ts           # GitHub Gist API + caching
│   │   └── crypto.ts         # AES-256-GCM encryption
│   ├── commands/
│   │   ├── setup.ts          # /setup command
│   │   ├── config.ts         # /config command
│   │   ├── product.ts        # /product command
│   │   ├── drop.ts           # /drop command
│   │   ├── announce.ts       # /announce command
│   │   ├── sync.ts           # /sync command
│   │   └── help.ts           # /help command
│   ├── handlers/
│   │   ├── interaction.ts    # Main interaction router
│   │   ├── modal.ts          # Modal submissions
│   │   └── autocomplete.ts   # ID autocomplete
│   └── ui/
│       └── embeds.ts         # Embed + modal builders
├── data/
│   └── bot.db                # SQLite database (auto-created)
├── dist/                     # Compiled output
├── package.json
├── tsconfig.json
├── .env.example
└── PLAN.md
```

## Schema Detection

Auto-detects Gist JSON structure:
1. Fetches Gist content
2. Finds `products` array (standard key)
3. Finds drops array (checks: `drops`, `upcomingItems`, `upcoming`, `releases`)
4. Categorizes fields for embed display

Works with any shop schema that has:
- `products` array with `id` field
- Secondary array for drops/upcoming items

## Database

SQLite with three tables:
- `servers`: Guild configs (gist_id, encrypted token, schema)
- `permissions`: User/role permission assignments
- `cache`: Gist data cache (5 min TTL)

## Environment Variables

```env
DISCORD_TOKEN=           # Bot token from Discord Developer Portal
DISCORD_CLIENT_ID=       # Application ID
ENCRYPTION_KEY=          # 32-byte hex (64 chars) for AES-256
OWNER_ID=501420209760894987  # Optional override
```

Generate encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Implementation Status

- [x] Phase 1: Project setup (package.json, tsconfig, config)
- [x] Phase 2: Database (SQLite, models, encryption)
- [x] Phase 3: Schema detection
- [x] Phase 4: Gist service (fetch, update, cache)
- [x] Phase 5: All commands
- [x] Phase 6: UI (embeds, modals)
- [x] Phase 7: Handlers (interaction, modal, autocomplete)
- [x] Phase 8: Command registration

## Next Steps (Optional)

- [ ] Pagination for large product lists
- [ ] Edit commands (currently add/delete only)
- [ ] Button confirmations for delete
- [ ] Logging to file
- [ ] Rate limiting
