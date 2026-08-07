/**
 * @wireframe-skill multi-screen-wireframe@1.3.0
 * 创建基于 v1.3.0
 * 修改基于 v1.3.0
 */
import { Column, Heading, Text } from '../../framework/lib/ui/index.js'

export function TemplateScreen() {
  return (
    <Column gap={12} style={{ padding: 24 }}>
      <Heading level={1}>页面标题</Heading>
      <Text>在这里编写页面内容。</Text>
    </Column>
  )
}
