/**
 * @wireframe-skill multi-screen-wireframe@1.3.0
 * 创建基于 v1.3.0
 * 修改基于 v1.3.0
 */
import { Column, Heading, Text } from '../../framework/lib/ui/index.js'

export function DetailScreen() {
  return (
    <Column gap={16} style={{ padding: 24 }}>
      <Heading level={1}>详情页</Heading>
      <Text>这是一个最小导航目标。</Text>
    </Column>
  )
}
