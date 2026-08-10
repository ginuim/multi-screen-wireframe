/**
 * @wireframe-skill multi-screen-wireframe@1.6.0
 * 创建基于 v1.6.0
 * 修改基于 v1.6.0
 */
import { Column, Heading, Text } from '../../framework/lib/ui/index.js'

export function TemplateScreen() {
  return (
    <Column id="screen-id-page" className="screen-id-page" gap={12} style={{ padding: 24 }}>
      <Heading id="screen-id-title" className="screen-id-page__title" level={1}>页面标题</Heading>
      <Text className="screen-id-page__description">在这里编写页面内容。</Text>
    </Column>
  )
}
