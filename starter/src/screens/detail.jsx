import { Column, Heading, Text } from '../../lib/ui/index.js'

export function DetailScreen() {
  return (
    <Column gap={16} style={{ padding: 24 }}>
      <Heading level={1}>详情页</Heading>
      <Text>这是一个最小导航目标。</Text>
    </Column>
  )
}
