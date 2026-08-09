/**
 * @wireframe-skill multi-screen-wireframe@1.5.1
 * 创建基于 v1.3.0
 * 修改基于 v1.5.1
 */
import { Column, Heading, Text } from '../../framework/lib/ui/index.js'

export function DetailScreen() {
  return (
    <Column id="detail-page" className="detail-page" gap={16} style={{ padding: 24 }}>
      <Heading id="detail-title" className="detail-page__title" level={1}>详情页</Heading>
      <Text className="detail-page__description">这是一个最小导航目标。</Text>
    </Column>
  )
}
