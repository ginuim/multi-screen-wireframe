/**
 * @wireframe-skill multi-screen-wireframe@1.3.0
 * 创建基于 v1.3.0
 * 修改基于 v1.3.0
 */
import { Button, Column, Heading, Text } from '../../framework/lib/ui/index.js'

export function HomeScreen() {
  return (
    <Column gap={16} style={{ padding: 24 }}>
      <Heading level={1}>线框首页</Heading>
      <Text>从 src/screens 开始编辑页面。</Text>
      <Button to="detail">查看详情</Button>
    </Column>
  )
}
