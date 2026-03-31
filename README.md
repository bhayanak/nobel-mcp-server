<p align="center">
  <img src="packages/nobel-prize-vscode-extension/logo.png" alt="Nobel Prize MCP Server" width="128" />
</p>

<h1 align="center">Nobel Prize MCP Server</h1>

[![CI](https://github.com/bhayanak/nobel-prize-mcp-server/actions/workflows/ci.yml/badge.svg)](https://github.com/bhayanak/nobel-prize-mcp-server/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg)](https://nodejs.org)

A **Model Context Protocol (MCP) server** that gives AI assistants structured access to the [Nobel Prize API v2.1](https://api.nobelprize.org/2.1/). Query laureates, prizes, categories, country stats, and historical trends spanning **1901 to present** across all six prize categories.

Available as both a **standalone MCP server** (npm) and a **VS Code extension** with automatic MCP integration.

## 🏗️ Packages

| Package | Description | Links |
|---------|-------------|-------|
| [`nobel-prize-mcp-server`](packages/nobel-prize-server/) | Standalone MCP server (stdio) | [![npm](https://img.shields.io/npm/v/nobel-prize-mcp-server.svg)](https://www.npmjs.com/package/nobel-prize-mcp-server) |
| [`nobel-prize-vscode-extension`](packages/nobel-prize-vscode-extension/) | VS Code extension with built-in MCP server | [![VS Code](https://img.shields.io/badge/VS%20Code-Marketplace-blue.svg)](https://marketplace.visualstudio.com/items?itemName=bhayanak.nobel-prize-vscode-extension) |

## 🛠️ Tools (8 Total)

| Tool | Description |
|------|-------------|
| `nobel_get_laureate` | Get laureate bio, prizes, motivation, and affiliations by name or ID |
| `nobel_search_laureates` | Search laureates by name, gender, country, category, or year range |
| `nobel_get_prizes` | Search prizes by category, year, or year range |
| `nobel_get_prize_by_year` | Get all prizes awarded in a specific year |
| `nobel_list_categories` | List all 6 categories with statistics |
| `nobel_get_category_stats` | Detailed stats for a specific category (decade breakdown) |
| `nobel_get_country_stats` | Nobel Prize rankings by country |
| `nobel_get_trends` | Historical trends: age, gender, shared prizes, country shifts |

## ⚡ Quick Start

### Option A: VS Code Extension (Recommended)

Install from the VS Code Marketplace — the MCP server starts automatically with full start/stop/restart controls.

→ [Extension Setup Guide](packages/nobel-prize-vscode-extension/README.md)

### Option B: Standalone MCP Server

```bash
npx nobel-prize-mcp-server
```

→ [Server Setup Guide](packages/nobel-prize-server/README.md)

## 🏠 Development

```bash
# Clone and install
git clone https://github.com/bhayanak/nobel-prize-mcp-server.git
cd nobel-prize-mcp-server
pnpm install

# Build all packages
pnpm run build

# Run tests (64 tests, 99%+ coverage)
pnpm run test:coverage

# Full CI pipeline
pnpm run ci
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm run build` | Build all packages |
| `pnpm run dev` | Run MCP server in dev mode |
| `pnpm run test` | Run all tests |
| `pnpm run test:coverage` | Tests with V8 coverage |
| `pnpm run lint` / `lint:fix` | ESLint with security rules |
| `pnpm run typecheck` | TypeScript type checking |
| `pnpm run format` / `format:fix` | Prettier formatting |
| `pnpm run package` | Create npm tarball + VSIX |
| `pnpm run ci` | Full CI: typecheck → lint → test → format → build |

## 📄 License

[MIT](LICENSE) © bhayanak
