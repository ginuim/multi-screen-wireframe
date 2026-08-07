import { execFileSync } from 'node:child_process'

export function darwinEsbuild(root) {
  const arch = execFileSync('uname', ['-m'], { encoding: 'utf8' }).trim()
  if (arch === 'arm64') return new URL('./framework/tools/esbuild-darwin-arm64', root).pathname
  if (arch === 'x86_64') return new URL('./framework/tools/esbuild-darwin-x64', root).pathname
  throw new Error(`Unsupported macOS architecture: ${arch}`)
}
