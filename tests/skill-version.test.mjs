import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const version = readFileSync(join(root, 'VERSION'), 'utf8').trim()
assert.match(version, /^\d+\.\d+\.\d+$/)

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
assert.equal(pkg.version, version)

const skill = readFileSync(join(root, 'SKILL.md'), 'utf8')
assert.match(skill, new RegExp(`^version:\\s*${version.replace(/\./g, '\\.')}\\s*$`, 'm'))
assert.match(skill, /版本注释/)
assert.match(skill, /@wireframe-skill multi-screen-wireframe@/)
assert.match(skill, /创建基于/)
assert.match(skill, /修改基于/)

const template = readFileSync(join(root, 'starter', 'src', 'screens', '_template.jsx'), 'utf8')
assert.match(template, new RegExp(`@wireframe-skill multi-screen-wireframe@${version.replace(/\./g, '\\.')}`))
assert.match(template, new RegExp(`创建基于 v${version.replace(/\./g, '\\.')}`))
assert.match(template, new RegExp(`修改基于 v${version.replace(/\./g, '\\.')}`))
assert.ok(template.indexOf('@wireframe-skill') < template.indexOf('import '), 'version comment must precede imports')

console.log('skill-version: pass')
