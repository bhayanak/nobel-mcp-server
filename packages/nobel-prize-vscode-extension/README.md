# Nobel Prize MCP Server — VS Code Extension

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue.svg)](https://marketplace.visualstudio.com/items?itemName=bhayanak.nobel-prize-vscode-extension)
[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](../../LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-%3E%3D1.99.0-blue.svg)](https://code.visualstudio.com)

A VS Code extension that runs the **Nobel Prize MCP Server** as a native MCP server inside VS Code. Appears in the MCP servers list with automatic **start/stop/restart/show config/show output** controls — no manual configuration needed.

<p align="center">
  <img src="logo.png" width="128" alt="Nobel Prize MCP Server Logo" />
</p>

## 🚀 Installation

### From VS Code Marketplace

1. Open VS Code (v1.99.0+)
2. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for **"Nobel Prize MCP Server"**
4. Click **Install**

The MCP server starts automatically and appears in VS Code's MCP servers list.

### From VSIX

```bash
code --install-extension nobel-prize-mcp-extension-0.1.0.vsix
```

## ✨ Features

- **Native MCP Integration**: Appears in VS Code's MCP servers list under Extensions
- **Auto Start/Stop**: VS Code manages the server lifecycle automatically
- **8 Nobel Prize Tools**: Query laureates, prizes, categories, countries, and trends
- **Configurable via Settings**: All server options available in VS Code Settings UI
- **Zero Setup**: No API keys needed — Nobel Prize API is public

## ⚙️ Configuration

All settings are available under **Settings → Nobel Prize MCP Server** (`nobelPrizeMcp.*`):

| Setting | Default | Description |
|---------|---------|-------------|
| `nobelPrizeMcp.baseUrl` | `https://api.nobelprize.org/2.1` | API base URL |
| `nobelPrizeMcp.cacheTtlMs` | `86400000` (24h) | Cache TTL in ms |
| `nobelPrizeMcp.cacheMaxSize` | `200` | Max cache entries |
| `nobelPrizeMcp.timeoutMs` | `10000` | HTTP request timeout |
| `nobelPrizeMcp.language` | `en` | Language (`en`, `se`, `no`) |
| `nobelPrizeMcp.perPage` | `25` | Results per page |

Changes are detected automatically — VS Code will prompt you to restart the MCP server.

## 🛠️ Available Tools

Once installed, the following MCP tools become available to any AI assistant (Copilot, Claude, etc.):

| Tool | Description |
|------|-------------|
| `nobel_get_laureate` | Laureate bio, prizes, motivation by name or ID |
| `nobel_search_laureates` | Search by name, gender, country, category, year range |
| `nobel_get_prizes` | Search prizes by category/year |
| `nobel_get_prize_by_year` | All prizes for a specific year |
| `nobel_list_categories` | All 6 categories with stats |
| `nobel_get_category_stats` | Detailed category statistics with decade breakdown |
| `nobel_get_country_stats` | Country rankings and breakdowns |
| `nobel_get_trends` | Age, gender, shared prize, and country trends |

### Example Prompts

Try asking your AI assistant:

- *"Who won the Nobel Prize in Physics in 2023?"*
- *"Tell me about Marie Curie's Nobel Prizes"*
- *"Show me the gender distribution trends in Nobel Prizes"*
- *"Which countries have the most Nobel Prizes in Literature?"*
- *"What are the trends in shared vs sole Nobel Prizes?"*

## 🏗️ How It Works

The extension bundles the Nobel Prize MCP Server and registers it as a native VS Code MCP server using `McpStdioServerDefinition`. VS Code manages the server process lifecycle:

```
VS Code ──► Extension activates on startup
         ──► Registers McpServerDefinitionProvider
         ──► VS Code spawns server process (dist/server.js)
         ──► MCP tools become available to AI assistants
```

- Uses VS Code's own Node.js (`process.execPath`) to run the server
- Configuration is read from VS Code Settings and passed as environment variables
- Server communicates via stdio (standard MCP protocol)

## 🧪 Development

```bash
# From monorepo root
pnpm install
pnpm --filter nobel-prize-vscode-extension run build    # Build extension + server
pnpm --filter nobel-prize-vscode-extension run package   # Create VSIX
pnpm --filter nobel-prize-vscode-extension run dev       # Watch mode
```

### Building the VSIX

```bash
pnpm run package
# Creates: nobel-prize-mcp-extension-<version>.vsix
```

The VSIX includes both `dist/extension.js` (activation logic) and `dist/server.js` (self-contained MCP server).

## 📄 License

[MIT](../../LICENSE) © bhayanak
