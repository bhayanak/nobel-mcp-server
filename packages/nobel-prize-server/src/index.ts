#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { NobelPrizeClient } from './api/client.js'
import { loadConfig } from './config.js'
import { createServer } from './server.js'

async function main() {
  const config = loadConfig()
  const client = new NobelPrizeClient(config)
  const server = createServer(client)

  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((error) => {
  console.error('Nobel Prize MCP Server failed to start:', error)
  process.exit(1)
})
