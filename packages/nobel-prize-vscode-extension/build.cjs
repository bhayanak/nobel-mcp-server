const esbuild = require('esbuild')
const path = require('path')

const isWatch = process.argv.includes('--watch')

const serverEntry = path.resolve(__dirname, '..', 'nobel-prize-server', 'src', 'index.ts')

const shared = {
  bundle: true,
  format: 'cjs',
  platform: 'node',
  target: 'node18',
  sourcemap: true,
  minify: false,
}

async function build() {
  // Build 1: Extension entry point
  const extensionConfig = {
    ...shared,
    entryPoints: ['src/extension.ts'],
    outfile: 'dist/extension.js',
    external: ['vscode'],
  }

  // Build 2: MCP server — fully self-contained
  const serverConfig = {
    ...shared,
    entryPoints: [serverEntry],
    outfile: 'dist/server.js',
  }

  if (isWatch) {
    const [extCtx, srvCtx] = await Promise.all([
      esbuild.context(extensionConfig),
      esbuild.context(serverConfig),
    ])
    await Promise.all([extCtx.watch(), srvCtx.watch()])
    console.log('Watching for changes...')
  } else {
    await Promise.all([esbuild.build(extensionConfig), esbuild.build(serverConfig)])
    console.log('Extension built successfully')
  }
}

build().catch((err) => {
  console.error(err)
  process.exit(1)
})
