import * as vscode from 'vscode'
import * as path from 'path'

export function activate(context: vscode.ExtensionContext): void {
  const serverPath = path.join(context.extensionPath, 'dist', 'server.js')
  const outputChannel = vscode.window.createOutputChannel('Nobel Prize MCP')
  context.subscriptions.push(outputChannel)

  // Register MCP server definition provider
  const provider: vscode.McpServerDefinitionProvider = {
    provideMcpServerDefinitions(_token: vscode.CancellationToken) {
      const env = buildEnvFromConfig(vscode.workspace.getConfiguration('nobelPrizeMcp'))
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

  // Watch for config changes
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

function buildEnvFromConfig(config: vscode.WorkspaceConfiguration): Record<string, string> {
  const env: Record<string, string> = {}

  const baseUrl = config.get<string>('baseUrl')
  if (baseUrl) env.NOBEL_MCP_BASE_URL = baseUrl

  const cacheTtlMs = config.get<number>('cacheTtlMs')
  if (cacheTtlMs !== undefined) env.NOBEL_MCP_CACHE_TTL_MS = String(cacheTtlMs)

  const cacheMaxSize = config.get<number>('cacheMaxSize')
  if (cacheMaxSize !== undefined) env.NOBEL_MCP_CACHE_MAX_SIZE = String(cacheMaxSize)

  const timeoutMs = config.get<number>('timeoutMs')
  if (timeoutMs !== undefined) env.NOBEL_MCP_TIMEOUT_MS = String(timeoutMs)

  const language = config.get<string>('language')
  if (language) env.NOBEL_MCP_LANGUAGE = language

  const perPage = config.get<number>('perPage')
  if (perPage !== undefined) env.NOBEL_MCP_PER_PAGE = String(perPage)

  return env
}
