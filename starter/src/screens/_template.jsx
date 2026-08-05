import { Column, Heading, Text } from '../../lib/ui/index.js'

export function TemplateScreen() {
  return (
    <Column gap={12} style={{ padding: 24 }}>
      <Heading level={1}>页面标题</Heading>
      <Text>在这里编写页面内容。</Text>
    </Column>
  )
}
