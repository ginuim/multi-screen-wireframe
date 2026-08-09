/**
 * @wireframe-skill multi-screen-wireframe@1.5.1
 * 创建基于 v1.3.0
 * 修改基于 v1.5.1
 */
import {
  Card,
  Cell,
  Column,
  Heading,
  Row,
  Text,
} from '../../../../starter/framework/lib/ui/index.js'
import { MobileLayout } from '../layouts/MobileLayout.jsx'

export function HomeScreen() {
  return (
    <MobileLayout>
      <Column id="claims-home-page" gap={16} className="claims-page claims-home__page">
        <Row id="claims-home-header" className="claims-home__header" alignItems="center" justifyContent="space-between">
          <div className="claims-home__greeting">
            <Text className="claims-home__eyebrow">上午好</Text>
            <Heading id="claims-home-title" className="claims-home__title" level={1}>理赔服务</Heading>
          </div>
          <span className="claims-avatar-placeholder claims-home__avatar" aria-hidden="true" />
        </Row>
        <Card id="claims-home-apply-card" className="claims-home__apply-card" to="claim-apply">
          <Heading className="claims-home__apply-title" level={3}>发起理赔</Heading>
          <Text className="claims-home__apply-description">准备材料并填写申请。</Text>
        </Card>
        <Column id="claims-home-shortcuts" className="claims-home__shortcuts" gap={0}>
          <Cell className="claims-home__shortcut claims-home__claims-shortcut" to="claims" title="我的理赔" subtitle="查看全部申请" value="0" />
          <Cell className="claims-home__shortcut claims-home__profile-shortcut" to="profile" title="个人信息" subtitle="管理联系方式" />
        </Column>
      </Column>
    </MobileLayout>
  )
}
