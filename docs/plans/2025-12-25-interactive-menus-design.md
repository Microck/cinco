# Interactive Selection Design

## Overview
Replace manual ID entry for `edit`, `delete`, and `view` commands with interactive Discord Select Menus (dropdowns).

## User Flow
1. User runs `/product edit` (no arguments).
2. Bot replies with a ephemeral message containing a `StringSelectMenu` of available products.
   - **Label**: Product Name
   - **Description**: Product ID / Price (context)
   - **Value**: Product ID
3. User selects a product from the dropdown.
4. Bot receives `interaction.isStringSelectMenu()` event.
5. Bot triggers the appropriate action:
   - **Edit**: Opens the Edit Modal (same as before).
   - **Delete**: Deletes the item and updates the message.
   - **View**: Shows the product embed.

## Technical Components

### 1. `src/ui/menus.ts` (New File)
- `buildProductSelectMenu(products: Product[], action: 'edit' | 'delete' | 'view'): ActionRowBuilder`
- `buildDropSelectMenu(drops: Drop[], action: 'edit' | 'delete' | 'view'): ActionRowBuilder`
- Handle pagination if > 25 items (Discord limit).
  - *MVP approach*: Just slice first 25 items for now. Warning if > 25.

### 2. `src/commands/product.ts` & `src/commands/drop.ts`
- Modify subcommand handling.
- If `id` option is missing -> Send Select Menu.
- If `id` option is present -> Keep existing behavior (fast path).

### 3. `src/handlers/interaction.ts`
- Add routing for `StringSelectMenuInteraction`.
- ID format: `product_select_<action>` or `drop_select_<action>`.
- Parse the selected value (ID) and call the logic.

### 4. `src/register.ts`
- Update Slash Command definitions.
- Make `id` option **optional** (required: false) for `edit`, `view`, `delete` subcommands.

## Trade-offs
- **Pros**: Better UX, no copy-pasting IDs, "Cooler" B option.
- **Cons**: 2-step process (Command -> Select -> Action) is slower for power users. Discord limits select menus to 25 items.
- **Mitigation**: Keep the `id` argument as optional. If provided, skip the menu. Best of both worlds.

Looks right? I'll proceed with this hybrid approach (Menu default, Argument optional).
