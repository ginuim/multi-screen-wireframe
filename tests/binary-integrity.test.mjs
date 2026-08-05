import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { darwinEsbuild } from './test-platform.mjs'

const tools = new URL('../starter/tools/', import.meta.url)
const expected = new Map(
  readFileSync(new URL('./SHA256SUMS', tools), 'utf8')
    .trim()
    .split('\n')
    .map((line) => line.trim().split(/\s+/)),
)

for (const [hash, file] of [...expected].map(([hash, file]) => [hash, file])) {
  const actual = createHash('sha256').update(readFileSync(new URL(`./${file}`, tools))).digest('hex')
  assert.equal(actual, hash, `${file} SHA-256`)
}

const arm = readFileSync(new URL('./esbuild-darwin-arm64', tools))
const x64 = readFileSync(new URL('./esbuild-darwin-x64', tools))
const windows = readFileSync(new URL('./esbuild-windows-x64.exe', tools))
assert.equal(arm.readUInt32LE(0), 0xfeedfacf)
assert.equal(arm.readUInt32LE(4), 0x0100000c)
assert.equal(x64.readUInt32LE(0), 0xfeedfacf)
assert.equal(x64.readUInt32LE(4), 0x01000007)
assert.equal(windows.subarray(0, 2).toString(), 'MZ')
const peOffset = windows.readUInt32LE(0x3c)
assert.equal(windows.subarray(peOffset, peOffset + 4).toString('binary'), 'PE\u0000\u0000')

const currentBinary = darwinEsbuild(new URL('../starter/', import.meta.url))
assert.equal(execFileSync(currentBinary, ['--version'], { encoding: 'utf8' }).trim(), '0.28.1')

const versions = readFileSync(new URL('./VERSIONS.txt', tools), 'utf8')
for (const packageName of [
  '@esbuild/darwin-arm64@0.28.1',
  '@esbuild/darwin-x64@0.28.1',
  '@esbuild/win32-x64@0.28.1',
]) {
  assert.match(versions, new RegExp(packageName.replace(/[./@-]/g, '\\$&')))
}

console.log('binary-integrity: pass')
