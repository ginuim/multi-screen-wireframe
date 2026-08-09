/**
 * @wireframe-skill multi-screen-wireframe@1.5.1
 * 创建基于 v1.3.0
 * 修改基于 v1.5.1
 */
import { Button, Column, Heading, Text } from '../../framework/lib/ui/index.js'

export function HomeScreen() {
  return (
    <Column id="home-page" className="home-page" gap={16} style={{ padding: 24 }}>
      <Heading id="home-title" className="home-page__title" level={1}>线框首页</Heading>
      <Text className="home-page__description">从 src/screens 开始编辑页面。</Text>
      <Button id="home-detail-action" className="home-page__detail-action" to="detail">查看详情</Button>
    </Column>
  )
}
