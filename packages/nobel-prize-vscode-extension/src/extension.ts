import * as vscode from 'vscode'
import * as path from 'path'

function buildEnvFromConfig(config: vscode.WorkspaceConfiguration): Record<string, string> {
  const env: Record<string, string> = {}
  const map: Record<string, string> = {
    baseUrl: 'NOBEL_MCP_BASE_URL',
    cacheTtlMs: 'NOBEL_MCP_CACHE_TTL_MS',
    cacheMaxSize: 'NOBEL_MCP_CACHE_MAX_SIZE',
    timeoutMs: 'NOBEL_MCP_TIMEOUT_MS',
    language: 'NOBEL_MCP_LANGUAGE',
    perPage: 'NOBEL_MCP_PER_PAGE',
  }
  for (const [key, envVar] of Object.entries(map)) {
    const val = config.get(key)
    if (val !== undefined && val !== null) {
      env[envVar] = String(val)
    }
  }
  return env
}

export function activate(context: vscode.ExtensionContext): void {
  const serverPath = path.join(context.extensionPath, 'dist', 'server.js')

  const provider: vscode.McpServerDefinitionProvider = {
    provideMcpServerDefinitions(): vscode.McpServerDefinition[] {
      const config = vscode.workspace.getConfiguration('nobelPrizeMcp')
      const env = buildEnvFromConfig(config)
      return [
        new vscode.McpStdioServerDefinition(
          'Nobel Prize MCP Server',
          process.execPath,
          [serverPath],
          env,
          context.extension.packageJSON.version,
        ),
      ]
    },
  }

  context.subscriptions.push(
    vscode.lm.registerMcpServerDefinitionProvider('nobel-prize-mcp', provider),
  )

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('nobelPrizeMcp')) {
        vscode.window.showInformationMessage(
          'Nobel Prize MCP configuration changed. Restart the MCP server for changes to take effect.',
        )
      }
    }),
  )
}

export function deactivate(): void {}
