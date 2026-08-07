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
      <Column gap={16} className="claims-page">
        <Row alignItems="center" justifyContent="space-between">
          <div>
            <Text>上午好</Text>
            <Heading level={1}>理赔服务</Heading>
          </div>
          <span className="claims-avatar-placeholder" aria-hidden="true" />
        </Row>
        <Card to="claim-apply">
          <Heading level={3}>发起理赔</Heading>
          <Text>准备材料并填写申请。</Text>
        </Card>
        <Column gap={0}>
          <Cell to="claims" title="我的理赔" subtitle="查看全部申请" value="0" />
          <Cell to="profile" title="个人信息" subtitle="管理联系方式" />
        </Column>
      </Column>
    </MobileLayout>
  )
}
