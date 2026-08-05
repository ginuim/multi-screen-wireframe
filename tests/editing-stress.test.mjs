import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { darwinEsbuild } from './test-platform.mjs'

const starter = fileURLToPath(new URL('../starter/', import.meta.url))
const temp = mkdtempSync(join(tmpdir(), 'wireframe-v2-editing-'))

try {
  for (let run = 1; run <= 5; run += 1) {
    const projectRoot = join(temp, `delivery-${run}`)
    cpSync(starter, projectRoot, { recursive: true })
    const agents = readFileSync(join(projectRoot, 'AGENTS.md'), 'utf8')
    assert.match(agents, /只修改.*src\//s)
    assert.match(agents, /禁止修改.*dist\/app\.js/s)

    const id = `stress-${run}`
    const component = `StressScreen${run}`
    writeFileSync(join(projectRoot, 'src', 'screens', `${id}.jsx`), `
import { Card, Column, Grid, Row, Text } from '../../lib/ui/index.js'

export function ${component}() {
  return (
    <Column gap={16} style={{ padding: 16 }}>
      <Row gap={8}><Text>第 ${run} 次编辑</Text></Row>
      <Grid columns={{ mobile: 1, desktop: 2 }} gap={12}>
        <Card to="home">返回首页</Card>
      </Grid>
    </Column>
  )
}
`.trimStart())

    const projectPath = join(projectRoot, 'src', 'project.js')
    let projectSource = readFileSync(projectPath, 'utf8')
    projectSource = `import { ${component} } from './screens/${id}.jsx'\n${projectSource}`
    projectSource = projectSource.replace(
      "links: ['detail'],",
      `links: ['detail', '${id}'],`,
    )
    projectSource = projectSource.replace(
      '\n  ],\n}',
      `
    {
      id: '${id}',
      title: '压力测试 ${run}',
      component: ${component},
      links: ['home'],
      edgeCases: [],
    },
  ],
}`,
    )
    writeFileSync(projectPath, projectSource)

    execFileSync(join(projectRoot, 'build.command'), { stdio: 'pipe' })
    const validationEntry = join(projectRoot, 'validation-entry.js')
    const validationOutput = join(projectRoot, 'validation.cjs')
    writeFileSync(validationEntry, `
import { validateProject } from './lib/core/validateProject.js'
import { project } from './src/project.js'
validateProject(project)
`.trimStart())
    execFileSync(darwinEsbuild(pathToFileURL(`${projectRoot}/`)), [
      validationEntry,
      '--bundle',
      '--platform=node',
      '--format=cjs',
      '--jsx-factory=React.createElement',
      `--outfile=${validationOutput}`,
    ], { stdio: 'pipe' })
    execFileSync(process.execPath, [
      '-e',
      `global.React={createContext(){return {}}};require(${JSON.stringify(validationOutput)})`,
    ], { stdio: 'pipe' })
  }
} finally {
  rmSync(temp, { recursive: true, force: true })
}

console.log('editing-stress: pass (5/5 deterministic delivery copies)')
